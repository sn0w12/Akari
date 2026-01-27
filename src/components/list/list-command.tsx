"use client";

import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import Spinner from "@/components/ui/puff-loader";
import { client } from "@/lib/api";
import { getSearchResults } from "@/lib/api/search";
import Toast from "@/lib/toast-wrapper";
import { generateSizes } from "@/lib/utils";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Image from "next/image";
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
            new Toast(error.data?.message || "Failed to add to list", "error");
            return;
        }

        new Toast("Added to list successfully", "success");
        queryClient.invalidateQueries({ queryKey: ["list", listId] });
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
                <Plus className="h-4 w-4" />
                Add manga
            </Button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Add manga to list"
                description="Search and add a manga to this list."
            >
                <CommandInput
                    placeholder="Search manga..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList data-scrollbar-custom>
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
                            <CommandGroup>
                                {searchResults.map((result) => {
                                    const isInList = existingEntryIds.has(
                                        result.id,
                                    );
                                    return (
                                        <CommandItem
                                            key={result.id}
                                            value={result.title}
                                            onSelect={() => {
                                                if (!isInList) {
                                                    void handleAdd(result.id);
                                                }
                                            }}
                                            disabled={isInList}
                                            className="flex items-center gap-3"
                                        >
                                            <Image
                                                src={result.cover}
                                                alt={result.title}
                                                className="rounded-sm"
                                                height={72}
                                                width={48}
                                                quality={40}
                                                sizes={generateSizes({
                                                    default: "48px",
                                                })}
                                            />
                                            <div className="flex flex-1 items-center justify-between gap-2">
                                                <span className="line-clamp-1">
                                                    {result.title}
                                                </span>
                                                {isInList ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        In list
                                                    </span>
                                                ) : null}
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
