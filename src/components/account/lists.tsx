"use client";

import { client } from "@/lib/api";
import { Button } from "../ui/button";
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
import Toast from "@/lib/toast-wrapper";
import { ListItem } from "./list-item";

interface UserMangaListsProps {
    initialLists: components["schemas"]["UserMangaListResponse"][];
}

export function UserMangaLists({ initialLists }: UserMangaListsProps) {
    const [lists, setLists] = useState(initialLists);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<
        components["schemas"]["CreateUserMangaListRequest"]
    >({
        title: "",
        description: "",
        isPublic: false,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) return;

        const { data, error } = await client.POST("/v2/lists", { body: form });
        if (error) {
            new Toast("Failed to create list", "error");
        } else {
            new Toast("List created successfully", "success");
            setLists((prev) => [...prev, data.data]);
            setOpen(false);
            setForm({ title: "", description: "", isPublic: false });
        }
    }

    function handleDelete(listId: string) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Your Manga Lists
                </h2>
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
            {lists.length === 0 ? (
                <div>No lists found.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {lists.map((list) => (
                        <ListItem
                            key={list.id}
                            list={list}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
