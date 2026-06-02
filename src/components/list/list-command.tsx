import { Image } from "@/components/image";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandDialogPopup,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandPanel,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/api";
import { getSearchResults } from "@/lib/api/search";
import { toastManager } from "@/components/ui/toast";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface ListCommandProps {
    listId: string;
    disabled?: boolean;
}

export function ListCommand({ listId, disabled }: ListCommandProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebouncedValue(query, { wait: 300 });
    const queryClient = useQueryClient();

    const { data: searchResults = [], isLoading } = useQuery({
        queryKey: ["list-command-search", debouncedQuery],
        queryFn: () => getSearchResults(debouncedQuery),
        enabled: debouncedQuery.trim().length > 0 && open,
        staleTime: 5 * 60 * 1000,
    });

    const existingEntryIds = useMemo(() => {
        const listData = queryClient.getQueryData(["list", listId]) as
            | components["schemas"]["UserMangaListWithEntriesResponse"]
            | undefined;
        if (!listData?.entries) return new Set<string>();
        return new Set(listData.entries.map((entry) => entry.mangaId));
    }, [listId, queryClient]);

    async function handleAdd(mangaId: string) {
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
            toastManager.add({
                title: error.data?.message || "Failed to add to list",
                type: "error",
            });
            return;
        }

        toastManager.add({
            title: "Added to list successfully",
            type: "success",
        });
        void queryClient.invalidateQueries({ queryKey: ["list", listId] });
        setOpen(false);
        setQuery("");
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                <Plus />
                Add manga
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandDialogPopup aria-label="Add manga to list">
                    <Command
                        items={searchResults}
                        mode="none"
                        value={query}
                        onValueChange={(v) => setQuery(v)}
                    >
                        <CommandInput placeholder="Search manga..." />
                        <CommandPanel>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>
                                        {query.trim().length > 0
                                            ? "No results"
                                            : "Type to search"}
                                    </CommandEmpty>
                                    <CommandList>
                                        {(
                                            item: components["schemas"]["MangaSearchResponse"],
                                        ) => (
                                            <CommandItem
                                                value={item.title}
                                                onClick={() =>
                                                    handleAdd(item.id)
                                                }
                                                disabled={existingEntryIds.has(
                                                    item.id,
                                                )}
                                                className="flex items-center gap-3"
                                            >
                                                <Image
                                                    src={item.cover}
                                                    alt={item.title}
                                                    className="rounded-sm"
                                                    height={72}
                                                    width={48}
                                                    sizes={{ default: "48px" }}
                                                    quality={40}
                                                />
                                                <div className="flex flex-1 items-center justify-between gap-2">
                                                    <span className="line-clamp-1">
                                                        {item.title}
                                                    </span>
                                                    {existingEntryIds.has(
                                                        item.id,
                                                    ) && (
                                                        <span className="text-xs text-muted-foreground">
                                                            In list
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        )}
                                    </CommandList>
                                </>
                            )}
                        </CommandPanel>
                    </Command>
                </CommandDialogPopup>
            </CommandDialog>
        </>
    );
}
