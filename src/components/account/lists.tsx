"use client";

import { useUser } from "@/contexts/user-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/contexts/confirm-context";
import { client } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import Toast from "@/lib/toast-wrapper";

export function ListsTabContent() {
    const { user } = useUser();
    const { confirm } = useConfirm();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<
        components["schemas"]["CreateUserMangaListRequest"]
    >({
        title: "",
        description: "",
        isPublic: false,
    });

    const { data, isLoading } = useQuery({
        queryKey: ["user-lists"],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await client.GET("/v2/lists/user/me");
            if (error) {
                return null;
            }

            return data;
        },
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;

        const { data, error } = await client.POST("/v2/lists", { body: form });
        if (error) {
            new Toast("Failed to create list", "error");
        } else {
            new Toast("List created successfully", "success");
            setOpen(false);
            setForm({ title: "", description: "", isPublic: false });
            queryClient.invalidateQueries({ queryKey: ["user-lists"] });
        }
    }

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
            queryClient.invalidateQueries({ queryKey: ["user-lists"] });
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!data || !data.data) {
        return null;
    }

    if (data.data.items.length === 0) {
        return <div>No lists found.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-lg font-semibold">Your Manga Lists</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Create List</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New List</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    className="resize-none"
                                    value={form.description ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isPublic"
                                    checked={form.isPublic}
                                    onCheckedChange={(checked) =>
                                        setForm({
                                            ...form,
                                            isPublic: !!checked,
                                        })
                                    }
                                />
                                <Label htmlFor="isPublic">Public</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            {data &&
                data.data &&
                data.data.items &&
                data.data.items.map((list) => (
                    <Link
                        key={list.id}
                        href={`/lists/${list.id}`}
                        className="block"
                    >
                        <Card className="relative p-0 hover:bg-accent transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex gap-2 items-center">
                                            <h3 className="font-semibold">
                                                {list.title}
                                            </h3>
                                            <Badge
                                                variant={
                                                    list.isPublic
                                                        ? "default"
                                                        : "secondary"
                                                }
                                                className="py-0 px-1.5"
                                            >
                                                {list.isPublic
                                                    ? "Public"
                                                    : "Private"}
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
                            </CardContent>
                        </Card>
                    </Link>
                ))}
        </div>
    );
}
