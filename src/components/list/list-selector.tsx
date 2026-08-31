import * as React from "react";

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxValue,
} from "@/components/ui/combobox";
import { useUser } from "@/hooks/use-user";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ListCreate } from "./list-create";

type ListOption = {
    value: string;
    label: string;
    isPublic: boolean;
};

type UserListsQueryData = {
    items: components["schemas"]["SuccessResponse_UserListResponse"]["data"][];
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    totalPages?: number;
};

export function ListSelector({ mangaId }: { mangaId: string }) {
    const [open, setOpen] = React.useState(false);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [value, setValue] = React.useState<ListOption[]>([]);
    const isMutatingRef = React.useRef(false);
    const queryClient = useQueryClient();
    const { data: user } = useUser();

    const { data: listData } = useQuery({
        queryKey: ["user-lists"],
        enabled: !!user,
        staleTime: Infinity,
        refetchOnMount: false,
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await client.GET("/v2/lists/user/me");
            if (error) {
                return null;
            }

            return data.data;
        },
    });

    const { data: existingListData } = useQuery({
        queryKey: ["existing-lists", mangaId],
        enabled: !!user,
        staleTime: Infinity,
        refetchOnMount: false,
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await client.GET(
                "/v2/lists/user/me/manga/{mangaId}",
                {
                    params: {
                        path: {
                            mangaId: mangaId,
                        },
                    },
                },
            );
            if (error) {
                return null;
            }

            return data.data;
        },
    });

    const comboItems = React.useMemo<ListOption[]>(
        () =>
            listData?.items.map((item) => ({
                label: item.title,
                value: item.id,
                isPublic: item.isPublic,
            })) ?? [],
        [listData],
    );

    const comboItemsById = React.useMemo(
        () => new Map(comboItems.map((item) => [item.value, item])),
        [comboItems],
    );

    React.useEffect(() => {
        setValue([]);
    }, [mangaId]);

    React.useEffect(() => {
        if (!user) {
            setValue([]);
            return;
        }

        if (isMutatingRef.current || !existingListData) {
            return;
        }

        setValue(
            existingListData
                .map((id) => comboItemsById.get(id))
                .filter((item): item is ListOption => !!item),
        );
    }, [comboItemsById, existingListData, user]);

    async function handleAddToList(listId: string) {
        const { error } = await client.POST("/v2/lists/{id}", {
            params: {
                path: {
                    id: listId,
                },
            },
            body: {
                mangaId: mangaId,
            },
        });

        if (error) {
            toastManager.add({ title: "Failed to add to list", type: "error" });
            return false;
        }

        toastManager.add({
            title: "Added to list successfully",
            type: "success",
        });
        return true;
    }

    async function handleRemoveFromList(listId: string) {
        const { data: listResponse, error: listError } = await client.GET(
            "/v2/lists/{id}",
            {
                params: {
                    path: {
                        id: listId,
                    },
                },
            },
        );

        if (listError) {
            toastManager.add({
                title: "Failed to load list entry",
                type: "error",
            });
            return false;
        }

        const entry = listResponse.data.entries.find(
            (item) => item.mangaId === mangaId,
        );

        if (!entry) {
            return true;
        }

        const { error } = await client.DELETE("/v2/lists/{id}/{entryId}", {
            params: {
                path: {
                    id: listId,
                    entryId: entry.id,
                },
            },
        });

        if (error) {
            toastManager.add({
                title: "Failed to remove from list",
                type: "error",
            });
            return false;
        }

        toastManager.add({
            title: "Removed from list successfully",
            type: "success",
        });
        return true;
    }

    async function handleValueChange(nextValue: ListOption[] | null) {
        if (isMutatingRef.current) {
            return;
        }

        const nextItems = nextValue ?? [];
        const previousItems = value;
        const previousIds = new Set(previousItems.map((item) => item.value));
        const nextIds = new Set(nextItems.map((item) => item.value));
        const addedItems = nextItems.filter(
            (item) => !previousIds.has(item.value),
        );
        const removedItems = previousItems.filter(
            (item) => !nextIds.has(item.value),
        );

        setValue(nextItems);

        if (addedItems.length === 0 && removedItems.length === 0) {
            return;
        }

        isMutatingRef.current = true;

        const addResults = await Promise.all(
            addedItems.map((item) => handleAddToList(item.value)),
        );
        const removeResults = await Promise.all(
            removedItems.map((item) => handleRemoveFromList(item.value)),
        );

        isMutatingRef.current = false;

        if (
            addResults.some((result) => !result) ||
            removeResults.some((result) => !result)
        ) {
            setValue(previousItems);
            return;
        }

        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["existing-lists", mangaId],
            }),
            ...addedItems.map((item) =>
                queryClient.invalidateQueries({
                    queryKey: ["list", item.value],
                }),
            ),
            ...removedItems.map((item) =>
                queryClient.invalidateQueries({
                    queryKey: ["list", item.value],
                }),
            ),
        ]);
    }

    function handleListCreated(
        list: components["schemas"]["SuccessResponse_UserListResponse"]["data"],
    ) {
        const createdOption: ListOption = {
            value: list.id,
            label: list.title,
            isPublic: list.isPublic,
        };

        queryClient.setQueryData<UserListsQueryData | null>(
            ["user-lists"],
            (current) => {
                if (!current) {
                    return {
                        items: [list],
                        totalCount: 1,
                        currentPage: 1,
                        pageSize: 1,
                        totalPages: 1,
                    };
                }

                if (current.items.some((item) => item.id === list.id)) {
                    return current;
                }

                return {
                    ...current,
                    items: [...current.items, list],
                    totalCount:
                        (current.totalCount ?? current.items.length) + 1,
                };
            },
        );

        setOpen(false);
        setValue((previous) => {
            if (previous.some((item) => item.value === createdOption.value)) {
                return previous;
            }

            return [...previous, createdOption];
        });

        void handleAddToList(list.id).then(async (wasAdded) => {
            setCreateOpen(false);

            if (!wasAdded) {
                setValue((previous) =>
                    previous.filter(
                        (item) => item.value !== createdOption.value,
                    ),
                );
                return;
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["existing-lists", mangaId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["list", list.id],
                }),
            ]);
        });
    }

    return (
        <>
            <div className="flex-1">
                <Combobox
                    items={comboItems}
                    value={value}
                    open={open}
                    onOpenChange={setOpen}
                    isItemEqualToValue={(a, b) => a.value === b.value}
                    onValueChange={(nextValue) => {
                        void handleValueChange(
                            nextValue as ListOption[] | null,
                        );
                    }}
                    multiple
                >
                    <ComboboxChips>
                        <ComboboxValue>
                            {(selectedItems: ListOption[]) => (
                                <>
                                    {selectedItems?.map((item) => (
                                        <ComboboxChip
                                            aria-label={item.label}
                                            key={item.value}
                                        >
                                            {item.label}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput
                                        aria-label="Select a list"
                                        size="lg"
                                        placeholder={
                                            selectedItems.length > 0
                                                ? undefined
                                                : "Select a list..."
                                        }
                                    />
                                </>
                            )}
                        </ComboboxValue>
                    </ComboboxChips>
                    <ComboboxPopup className="p-0 relative z-[2000]">
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item: ListOption) => (
                                <ComboboxItem key={item.value} value={item}>
                                    <span className="flex flex-col">
                                        <span className="truncate">
                                            {item.label}
                                        </span>
                                        <Badge
                                            variant={
                                                item.isPublic
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="truncate w-16 text-center justify-center"
                                        >
                                            {item.isPublic
                                                ? "Public"
                                                : "Private"}
                                        </Badge>
                                    </span>
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                        <div className="border-t p-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setCreateOpen(true)}
                            >
                                Create List
                            </Button>
                        </div>
                    </ComboboxPopup>
                </Combobox>
            </div>
            <ListCreate
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={handleListCreated}
                showTrigger={false}
            />
        </>
    );
}
