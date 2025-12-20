"use client";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { client } from "@/lib/api";
import type { components } from "@/types/api";
import { ImageIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/contexts/user-context";
import Image from "next/image";

type UploadResponse = components["schemas"]["UploadResponse"];

interface AttachmentPopoverProps {
    onSelect?: (upload: UploadResponse) => void;
}

export function AttachmentPopover({ onSelect }: AttachmentPopoverProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [tags, setTags] = useState("");
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser();

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
        queryKey: ["uploads"],
        queryFn: async () => {
            const { data } = await client.GET("/v2/uploads", {
                params: { query: { page: 1, pageSize: 50 } },
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" side="top">
                <Tabs defaultValue="select" className="w-full">
                    <TabsList>
                        <TabsTrigger value="select" index={0}>
                            Select
                        </TabsTrigger>
                        {user && (
                            <TabsTrigger value="my-uploads" index={2}>
                                My Uploads
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="upload" index={1}>
                            Upload
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="select" className="space-y-2">
                        <h4 className="font-medium text-sm">Select an image</h4>
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
                                    <button
                                        key={upload.id}
                                        onClick={() => {
                                            onSelect?.(upload);
                                            setOpen(false);
                                        }}
                                        className="max-h-24 w-auto overflow-hidden rounded border hover:border-primary transition-colors"
                                    >
                                        <Image
                                            src={upload.url}
                                            alt={upload.tags.join(", ")}
                                            className="w-full h-full object-cover"
                                            height={96}
                                            width={96}
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No images found.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="upload" className="space-y-2">
                        <h4 className="font-medium text-sm">Upload an image</h4>
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
                                        <p className="text-sm">{file.name}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
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
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
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
                            <h4 className="font-medium text-sm">My uploads</h4>
                            {isLoadingMy ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square bg-muted rounded animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : myUploads.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                                    {myUploads.map((upload) => (
                                        <button
                                            key={upload.id}
                                            onClick={() => {
                                                onSelect?.(upload);
                                                setOpen(false);
                                            }}
                                            className="max-h-24 w-auto overflow-hidden rounded border hover:border-primary transition-colors"
                                        >
                                            <Image
                                                src={upload.url}
                                                alt={upload.tags.join(", ")}
                                                className="w-full h-full object-cover"
                                                height={80}
                                                width={80}
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No uploads found.
                                </p>
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
