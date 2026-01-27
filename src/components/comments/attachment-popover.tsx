"use client";

import { Input } from "@/components/ui/input";
import {
    PopoverDrawer,
    PopoverDrawerContent,
    PopoverDrawerTrigger,
} from "@/components/ui/popover-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfirm } from "@/contexts/confirm-context";
import { useUser } from "@/contexts/user-context";
import { client } from "@/lib/api";
import { StorageManager } from "@/lib/storage";
import Toast from "@/lib/toast-wrapper";
import { generateSizes } from "@/lib/utils";
import type { components } from "@/types/api";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

type UploadResponse = components["schemas"]["UploadResponse"];

interface AttachmentPopoverProps {
    onSelect?: (upload: UploadResponse) => void;
}

function ImageGrid({
    uploads,
    isLoading,
    onSelect,
    emptyMessage,
    onClose,
    onDelete,
    onToggleFavorite,
    favorites = [],
}: {
    uploads: UploadResponse[];
    isLoading: boolean;
    onSelect?: (upload: UploadResponse) => void;
    emptyMessage: string;
    onClose: () => void;
    onDelete?: (upload: UploadResponse) => void;
    onToggleFavorite?: (upload: UploadResponse) => void;
    favorites?: string[];
}) {
    return (
        <>
            {isLoading ? (
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-muted rounded animate-pulse"
                        />
                    ))}
                </div>
            ) : uploads.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {uploads.map((upload) => (
                        <div
                            key={upload.id}
                            className="relative aspect-square w-full"
                        >
                            <button
                                onClick={() => {
                                    onSelect?.(upload);
                                    onClose();
                                }}
                                className="w-full h-full overflow-hidden rounded border hover:border-primary transition-colors"
                            >
                                <Image
                                    src={upload.url!}
                                    alt={upload.tags.join(", ")}
                                    className="w-full h-full object-contain"
                                    height={96}
                                    width={96}
                                    quality={60}
                                    sizes={generateSizes({
                                        default: "128px",
                                    })}
                                />
                            </button>
                            {onToggleFavorite && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(upload);
                                    }}
                                    className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
                                    aria-label="Toggle favorite"
                                >
                                    <Star
                                        className={`h-3 w-3 ${
                                            favorites.includes(upload.id)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                        }`}
                                    />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(upload);
                                    }}
                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
        </>
    );
}

export function AttachmentPopover({ onSelect }: AttachmentPopoverProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [tags, setTags] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();
    const { confirm } = useConfirm();

    // Load favorites from storage
    useEffect(() => {
        const storage = StorageManager.get("favoriteAttachments");
        const data = storage.getWithDefaults();
        setFavorites(data.ids as string[]);
    }, []);

    const toggleFavorite = (upload: UploadResponse) => {
        const storage = StorageManager.get("favoriteAttachments");
        const current = storage.getWithDefaults();
        const currentIds = current.ids as string[];
        const currentUrls = current.urls as string[];

        const index = currentIds.indexOf(upload.id);
        let newIds: string[];
        let newUrls: string[];

        if (index > -1) {
            // Remove from favorites
            newIds = currentIds.filter((_, i) => i !== index);
            newUrls = currentUrls.filter((_, i) => i !== index);
        } else {
            // Add to favorites
            newIds = [...currentIds, upload.id];
            newUrls = [...currentUrls, upload.url || ""];
        }

        storage.set({ ids: newIds, urls: newUrls });
        setFavorites(newIds);
    };

    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, {
        wait: 300,
    });

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    useEffect(() => {
        return () => {
            if (file) {
                URL.revokeObjectURL(URL.createObjectURL(file));
            }
        };
    }, [file]);

    const { data: uploads = [], isLoading } = useQuery({
        queryKey: ["uploads", debouncedSearchQuery],
        queryFn: async () => {
            const { data } = await client.GET("/v2/uploads", {
                params: {
                    query: {
                        page: 1,
                        pageSize: 50,
                        query: debouncedSearchQuery,
                    },
                },
            });
            return data?.data?.items || [];
        },
        enabled: open,
    });

    const { data: myUploads = [], isLoading: isLoadingMy } = useQuery({
        queryKey: ["my-uploads"],
        queryFn: async () => {
            const { data } = await client.GET("/v2/uploads/me", {
                params: { query: { page: 1, pageSize: 50 } },
            });
            return data?.data?.items || [];
        },
        enabled: open && !!user,
    });

    // Get favorite uploads from storage (no API calls needed)
    const favoriteUploads: UploadResponse[] = favorites.map((id, index) => {
        const storage = StorageManager.get("favoriteAttachments");
        const data = storage.getWithDefaults();
        const urls = data.urls as string[];

        return {
            id,
            userId: "",
            md5Hash: null,
            size: 0,
            url: urls[index] || "",
            usageCount: 0,
            tags: [],
            createdAt: "",
            deleted: false,
        } as UploadResponse;
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const tagsArray = tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        tagsArray.forEach((tag) => formData.append("tags", tag));

        try {
            const { data } = await client.POST("/v2/uploads", {
                body: formData as unknown as undefined,
            });
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["uploads"] });
                onSelect?.(data.data);
                setFile(null);
                setTags("");
                setOpen(false);
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (upload: UploadResponse) => {
        const confirmed = await confirm({
            title: "Confirm Deletion",
            description: "Are you sure you want to delete this upload?",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!confirmed) return;

        try {
            const { error } = await client.DELETE("/v2/uploads/{id}", {
                params: {
                    path: { id: upload.id },
                },
            });

            if (error) {
                new Toast("Failed to delete upload", "error");
                throw new Error(
                    error.data.message || "Failed to delete upload",
                );
            }

            new Toast("Upload deleted", "success");
            queryClient.invalidateQueries({ queryKey: ["my-uploads"] });
        } catch (error) {
            console.error("Failed to delete upload:", error);
            return;
        }
    };

    return (
        <PopoverDrawer open={open} onOpenChange={setOpen}>
            <PopoverDrawerTrigger>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!user}
                    aria-label="Manage Attachments"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </PopoverDrawerTrigger>
            <PopoverDrawerContent popoverSide="top" popoverClassName="w-96">
                <Tabs
                    defaultValue="select"
                    className="w-full text-base flex flex-col-reverse md:flex-col"
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="select">Select</TabsTrigger>
                        <TabsTrigger value="favorites">Favorites</TabsTrigger>
                        {user && (
                            <TabsTrigger value="my-uploads">
                                My Uploads
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="select" className="space-y-2">
                        <h4 className="font-medium">Select an image</h4>
                        <Input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search images..."
                            className="w-full"
                        />
                        <ImageGrid
                            uploads={uploads}
                            isLoading={isLoading}
                            onSelect={onSelect}
                            emptyMessage="No images found."
                            onClose={() => setOpen(false)}
                            onToggleFavorite={toggleFavorite}
                            favorites={favorites}
                        />
                    </TabsContent>
                    <TabsContent value="favorites" className="space-y-2">
                        <h4 className="font-medium">Favorite images</h4>
                        <ImageGrid
                            uploads={favoriteUploads}
                            isLoading={false}
                            onSelect={onSelect}
                            emptyMessage="No favorite images yet."
                            onClose={() => setOpen(false)}
                            onToggleFavorite={toggleFavorite}
                            favorites={favorites}
                        />
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-2">
                        <h4 className="font-medium">Upload an image</h4>
                        <form onSubmit={handleUpload} className="space-y-2">
                            <div
                                className={`border-2 border-dashed bg-background rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                    isDragOver
                                        ? "border-primary bg-primary/10"
                                        : "border-muted-foreground/25"
                                }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(true);
                                }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(false);
                                    const files = e.dataTransfer.files;
                                    if (files.length > 0) {
                                        setFile(files[0]);
                                    }
                                }}
                            >
                                {file ? (
                                    <div className="space-y-2">
                                        <Image
                                            src={previewUrl!}
                                            alt="Preview"
                                            className="max-h-20 mx-auto rounded"
                                            height={80}
                                            width={80}
                                        />
                                        <p>{file.name}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            Drop image here or click to select
                                        </p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] || null)
                                }
                                className="hidden"
                            />
                            <input
                                type="text"
                                placeholder="Enter tags separated by commas (optional)"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!file || uploading}
                                className="w-full"
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </form>
                    </TabsContent>
                    {user && (
                        <TabsContent value="my-uploads" className="space-y-2">
                            <h4 className="font-medium">My uploads</h4>
                            <ImageGrid
                                uploads={myUploads}
                                isLoading={isLoadingMy}
                                onSelect={onSelect}
                                emptyMessage="No uploads found."
                                onClose={() => setOpen(false)}
                                onDelete={handleDelete}
                                onToggleFavorite={toggleFavorite}
                                favorites={favorites}
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </PopoverDrawerContent>
        </PopoverDrawer>
    );
}
