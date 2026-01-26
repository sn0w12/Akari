"use client";

import { StorageManager } from "@/lib/storage";
import { generateSizes } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, Star } from "lucide-react";

export function CommentAttachment({
    attachment,
}: {
    attachment: components["schemas"]["UploadResponse"];
}) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const storage = StorageManager.get("favoriteAttachments");
        const data = storage.getWithDefaults();
        setIsFavorite((data.ids as string[]).includes(attachment.id));
    }, [attachment.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        const storage = StorageManager.get("favoriteAttachments");
        const current = storage.getWithDefaults();
        const currentIds = current.ids as string[];
        const currentUrls = current.urls as string[];

        const index = currentIds.indexOf(attachment.id);
        let newIds: string[];
        let newUrls: string[];

        if (index > -1) {
            // Remove from favorites
            newIds = currentIds.filter((_, i) => i !== index);
            newUrls = currentUrls.filter((_, i) => i !== index);
        } else {
            // Add to favorites
            newIds = [...currentIds, attachment.id];
            newUrls = [...currentUrls, attachment.url || ""];
        }

        storage.set({ ids: newIds, urls: newUrls });
        setIsFavorite(!isFavorite);
    };

    if (!attachment.url) {
        return (
            <div className="p-2 border-1 w-fit rounded-lg mb-2 flex flex-col items-center justify-center text-destructive border-destructive">
                <ImageIcon className="size-8" />
                <p>Attachment Deleted</p>
            </div>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="group rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background relative"
                    aria-label="Open attachment"
                >
                    <Image
                        src={attachment.url}
                        alt="Comment attachment"
                        className="max-w-64 h-auto rounded-md border transition-transform group-hover:scale-[1.01]"
                        height={160}
                        width={160}
                        sizes={generateSizes({
                            default: "256px",
                        })}
                    />
                    <button
                        onClick={toggleFavorite}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Toggle favorite"
                    >
                        <Star
                            className={`h-4 w-4 ${
                                isFavorite
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                            }`}
                        />
                    </button>
                </button>
            </DialogTrigger>
            <DialogContent
                className="flex max-h-[90vh] max-w-[90vw] sm:max-w-[90vw] w-auto items-center justify-center p-2"
                showCloseButton
            >
                <DialogTitle className="sr-only">
                    Comment attachment preview
                </DialogTitle>
                <Image
                    src={attachment.url}
                    alt="Comment attachment"
                    className="h-auto max-h-[85vh] w-auto max-w-[85vw] rounded-md"
                    height={1200}
                    width={1200}
                    sizes={generateSizes({
                        default: "90vw",
                    })}
                />
            </DialogContent>
        </Dialog>
    );
}
