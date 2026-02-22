"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/contexts/confirm-context";
import { useUser } from "@/contexts/user-context";
import { client } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";
import { generateSizes } from "@/lib/utils";
import { compressUUIDBase58 } from "@/lib/uuid";
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Share, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Avatar } from "../ui/avatar";
import { ListCommand } from "./list-command";
import { ListSkeleton } from "./list-skeleton";

function Entry({
    entry,
    userId,
    ownerId,
    dragHandle,
    dragProps,
    setNodeRef,
    style,
}: {
    entry: components["schemas"]["UserMangaListEntryResponse"];
    userId: string | undefined;
    ownerId: string;
    dragHandle?: ReactNode;
    dragProps?: HTMLAttributes<HTMLDivElement>;
    setNodeRef?: (node: HTMLDivElement | null) => void;
    style?: CSSProperties;
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
        <Card
            ref={setNodeRef}
            style={style}
            className="flex flex-row items-center gap-2 p-2"
        >
            {dragHandle && (
                <div className="self-stretch flex items-center" {...dragProps}>
                    {dragHandle}
                </div>
            )}
            <Link href={`/manga/${entry.mangaId}`} className="shrink-0">
                <Image
                    src={entry.mangaCover}
                    alt={entry.mangaTitle}
                    className="w-12 h-18 object-cover rounded-md"
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
                <div className="flex flex-col items-end gap-2 h-full">
                    <Button
                        variant="destructive"
                        className="self-start h-full"
                        size="sm"
                        onClick={handleRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </Card>
    );
}

function SortableEntry({
    entry,
    userId,
    ownerId,
    isDraggable,
}: {
    entry: components["schemas"]["UserMangaListEntryResponse"];
    userId: string | undefined;
    ownerId: string;
    isDraggable: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(entry.id), disabled: !isDraggable });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : undefined,
    };

    return (
        <Entry
            entry={entry}
            userId={userId}
            ownerId={ownerId}
            setNodeRef={setNodeRef}
            style={style}
            dragProps={attributes}
            dragHandle={
                isDraggable ? (
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-grab active:cursor-grabbing h-full"
                        {...listeners}
                        aria-label="Reorder entry"
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                ) : null
            }
        />
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

    const queryClient = useQueryClient();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    async function persistEntryOrder({
        listId,
        entryId,
        newOrderIndex,
        previous,
    }: {
        listId: string;
        entryId: string;
        newOrderIndex: number;
        previous: unknown;
    }) {
        const { error } = await client.PUT("/v2/lists/{id}/{entryId}", {
            params: {
                path: {
                    id: listId,
                    entryId: entryId,
                },
            },
            body: {
                newOrderIndex,
            },
        });

        if (error) {
            if (previous) {
                queryClient.setQueryData(["list", listId], previous);
            }
            new Toast(
                error.data?.message || "Failed to update entry order",
                "error",
            );
            return;
        }

        queryClient.invalidateQueries({ queryKey: ["list", listId] });
    }

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

    const isOwner = user?.userId === data.userId;

    function handleDragEnd(event: DragEndEvent) {
        if (!isOwner || !data) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const currentIndex = data.entries.findIndex(
            (item) => String(item.id) === String(active.id),
        );
        const newIndex = data.entries.findIndex(
            (item) => String(item.id) === String(over.id),
        );

        if (currentIndex === -1 || newIndex === -1) return;

        const previous = queryClient.getQueryData(["list", id]);

        queryClient.setQueryData(["list", id], (currentData: typeof data) => {
            if (!currentData) return currentData;
            const nextEntries = arrayMove(
                currentData.entries,
                currentIndex,
                newIndex,
            );
            return {
                ...currentData,
                entries: nextEntries,
            };
        });

        persistEntryOrder({
            listId: id,
            entryId: String(active.id),
            newOrderIndex: newIndex,
            previous,
        });
    }

    function handleShare() {
        const compressedId = compressUUIDBase58(id);
        const url = `${window.location.origin}/l/${compressedId}`;
        navigator.clipboard.writeText(url);
        new Toast("Share URL copied to clipboard", "success");
    }

    return (
        <div className="px-4 pb-4 pt-2 flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex flex-col md:flex-row md:gap-2">
                        <h1 className="text-2xl font-bold">{data.title}</h1>
                        <Link
                            href={`/user/${data.user.userId}`}
                            className="flex flex-row gap-1 items-center text-lg font-medium hover:underline"
                        >
                            <Avatar name={data.user.username} size={32} />
                            {data.user.displayName}
                        </Link>
                    </div>
                    <p className="text-muted-foreground">{data.description}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-2 items-end">
                    {isOwner && <ListCommand listId={id} />}
                    {data.isPublic && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                        >
                            <Share />
                            Share
                        </Button>
                    )}
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={data.entries.map((item) => String(item.id))}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                        {data.entries.map((item) => (
                            <SortableEntry
                                key={item.id}
                                entry={item}
                                userId={user?.userId}
                                ownerId={data.userId}
                                isDraggable={isOwner}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
