"use client";

import { useUser } from "@/contexts/user-context";
import { useConfirm } from "@/contexts/confirm-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/lib/toast-wrapper";
import { Avatar } from "../ui/avatar";
import { generateSizes } from "@/lib/utils";
import { ListSkeleton } from "./list-skeleton";

function Entry({
    entry,
    userId,
    ownerId,
}: {
    entry: components["schemas"]["UserMangaListEntryResponse"];
    userId: string | undefined;
    ownerId: string;
}) {
    const { confirm } = useConfirm();
    const queryClient = useQueryClient();

    async function handleRemove() {
        if (!userId) return;

        const confirmed = await confirm({
            title: "Confirm Removal",
            description: "Are you sure you want to remove this entry?",
            variant: "destructive",
        });
        if (!confirmed) return;

        try {
            const { error } = await client.DELETE("/v2/lists/{id}/{entryId}", {
                params: {
                    path: {
                        id: entry.listId,
                        entryId: entry.id,
                    },
                },
            });

            if (error) {
                new Toast("Failed to remove entry", "error");
                return;
            }

            new Toast("Entry removed successfully", "success");
            queryClient.invalidateQueries({ queryKey: ["list", ownerId] });
        } catch (error) {
            console.error("Failed to remove entry:", error);
        }
    }

    return (
        <Card className="flex flex-row items-center gap-4 p-4">
            <Link href={`/manga/${entry.mangaId}`} className="shrink-0">
                <Image
                    src={entry.mangaCover}
                    alt={entry.mangaTitle}
                    className="w-12 h-18 object-cover rounded"
                    width={48}
                    height={72}
                    quality={40}
                    sizes={generateSizes({
                        default: "48px",
                    })}
                />
            </Link>
            <div className="flex-1 min-w-0">
                <Link href={`/manga/${entry.mangaId}`}>
                    <h3 className="font-semibold truncate hover:underline">
                        {entry.mangaTitle}
                    </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.mangaDescription}
                </p>
            </div>
            {userId === ownerId && (
                <Button
                    variant="destructive"
                    className="self-start"
                    size="sm"
                    onClick={handleRemove}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </Card>
    );
}

export function ListComponent({ id }: { id: string }) {
    const { user } = useUser();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["list", id],
        queryFn: async () => {
            const { data, error } = await client.GET(`/v2/lists/{id}`, {
                params: {
                    path: {
                        id: id,
                    },
                },
            });

            if (error) {
                throw new Error(error.data?.message || "Failed to load list");
            }

            return data.data;
        },
    });

    if (isLoading) {
        return <ListSkeleton />;
    }

    if (isError) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">
                    Error Loading List
                </h2>
                <p className="text-muted-foreground">
                    {error?.message ||
                        "Something went wrong. Please try again."}
                </p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">List Not Found</h2>
                <p className="text-muted-foreground">
                    The requested list could not be found.
                </p>
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 pt-2">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{data.title}</h1>
                    <p className="text-muted-foreground">{data.description}</p>
                </div>
                <Link
                    href={`/user/${data.user.userId}`}
                    className="flex flex-row gap-1 items-center text-lg font-medium hover:underline"
                >
                    <Avatar name={data.user.username} size={32} />
                    {data.user.displayName}
                </Link>
            </div>
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {data.entries.map((item) => (
                    <Entry
                        key={item.id}
                        entry={item}
                        userId={user?.userId}
                        ownerId={data.userId}
                    />
                ))}
            </div>
        </div>
    );
}
