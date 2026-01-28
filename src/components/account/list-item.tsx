"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";

interface ListItemProps {
    list: components["schemas"]["UserMangaListResponse"];
    onDelete: (listId: string) => void;
}

export function ListItem({ list, onDelete }: ListItemProps) {
    const { user } = useUser();
    const { confirm } = useConfirm();

    async function deleteList(listId: string) {
        const confirmed = await confirm({
            title: "Delete List",
            description:
                "Are you sure you want to delete this list? This action cannot be undone.",
            confirmText: "Delete",
            variant: "destructive",
        });

        if (!confirmed) return;

        const { error } = await client.DELETE("/v2/lists/{id}", {
            params: {
                path: {
                    id: listId,
                },
            },
        });
        if (error) {
            new Toast("Failed to delete list", "error");
        } else {
            new Toast("List deleted successfully", "success");
            onDelete(listId);
        }
    }

    return (
        <Link href={`/lists/${list.id}`} className="block">
            <Card className="relative p-0 hover:bg-accent transition-colors">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex gap-2 items-center">
                                <h3 className="font-semibold">{list.title}</h3>
                                <Badge
                                    variant={
                                        list.isPublic ? "default" : "secondary"
                                    }
                                    className="py-0 px-1.5"
                                >
                                    {list.isPublic ? "Public" : "Private"}
                                </Badge>
                            </div>
                            {list.description && (
                                <p className="text-sm text-muted-foreground">
                                    {list.description}
                                </p>
                            )}
                            <p className="text-sm">
                                Entries: {list.totalEntries}
                            </p>
                        </div>
                    </div>
                    {user?.userId && list.userId === user.userId && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteList(list.id);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
