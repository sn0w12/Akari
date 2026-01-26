"use client";

import { generateSizes } from "@/lib/utils";
import Image from "next/image";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

export function CommentAttachment({
    attachment,
}: {
    attachment: components["schemas"]["UploadResponse"];
}) {
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
                    className="group rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
