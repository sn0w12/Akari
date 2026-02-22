"use client";

import { CheckSquare, ChevronsUpDown, Square } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/contexts/user-context";
import { useWindowWidth } from "@/hooks/use-window-width";
import { client } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../ui/badge";

export function ListSelector({ mangaId }: { mangaId: string }) {
    const [open, setOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const { user } = useUser();
    const windowWidth = useWindowWidth();
    const { data: listData } = useQuery({
        queryKey: ["user-lists"],
        enabled: !!user && open,
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
        enabled: !!user && open,
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
            new Toast("Failed to add to list", "error");
            return;
        }

        new Toast("Added to list successfully", "success");
        queryClient.invalidateQueries({ queryKey: ["existing-lists"] });
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select list"
                    className="flex-1 justify-between flex h-10"
                    disabled={!user}
                >
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>Select list</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 relative z-[2000]">
                <Command>
                    <React.Activity
                        mode={windowWidth < 768 ? "hidden" : "visible"}
                    >
                        <CommandInput placeholder="Search list..." />
                    </React.Activity>
                    <CommandList data-scrollbar-custom>
                        <CommandEmpty>No lists found.</CommandEmpty>
                        <CommandGroup>
                            {listData &&
                                listData.items &&
                                listData.items.map((list) => {
                                    const isInList =
                                        Array.isArray(existingListData) &&
                                        existingListData.includes(list.id);
                                    return (
                                        <CommandItem
                                            key={list.id}
                                            value={list.id}
                                            onSelect={() =>
                                                handleAddToList(list.id)
                                            }
                                            className="cursor-pointer justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isInList ? (
                                                    <CheckSquare className="h-4 w-4" />
                                                ) : (
                                                    <Square className="h-4 w-4" />
                                                )}
                                                {list.title}
                                            </div>
                                            <Badge
                                                variant={
                                                    list.isPublic
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="w-16 text-center justify-center"
                                            >
                                                {list.isPublic
                                                    ? "Public"
                                                    : "Private"}
                                            </Badge>
                                        </CommandItem>
                                    );
                                })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
