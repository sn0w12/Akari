"use client";

import { generateSizes } from "@/lib/utils";
import Image from "next/image";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function CommentAttachment({
    attachment,
}: {
    attachment: components["schemas"]["UploadResponse"];
}) {
    return (
        <Dialog>
            <div className="mt-2 mb-2">
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
            </div>
            <DialogContent
                className="flex max-h-[90vh] w-auto max-w-[90vw] items-center justify-center p-2 sm:max-w-5xl"
                showCloseButton
            >
                <DialogTitle className="sr-only">
                    Comment attachment preview
                </DialogTitle>
                <Image
                    src={attachment.url}
                    alt="Comment attachment"
                    className="h-auto max-h-[85vh] w-auto max-w-[90vw] rounded-md"
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
