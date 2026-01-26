"use client";

import type React from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateSizes } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ButtonGroup } from "../ui/button-group";
import { AttachmentPopover } from "./attachment-popover";

interface CommentFormProps {
    onSubmit: (
        content: string,
        attachment?: components["schemas"]["UploadResponse"],
    ) => Promise<void>;
    placeholder?: string;
    submitLabel?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
    currentUser?: components["schemas"]["UserResponse"];
}

export function CommentForm({
    onSubmit,
    placeholder = "Write a comment...",
    submitLabel = "Comment",
    onCancel,
    autoFocus = false,
    currentUser,
}: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<
        components["schemas"]["UploadResponse"] | undefined
    >(undefined);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, selectedAttachment);
            setContent("");
            setSelectedAttachment(undefined);
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <Avatar name={currentUser?.username || ""} />
            <div className="flex-1 space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[80px] resize-none text-sm sm:text-base"
                    autoFocus={autoFocus}
                    disabled={
                        isSubmitting || !currentUser || currentUser.banned
                    }
                />

                {selectedAttachment && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Image
                            src={selectedAttachment.url}
                            alt="Selected attachment"
                            className="h-10 w-10 object-cover rounded"
                            height={40}
                            width={40}
                            sizes={generateSizes({
                                default: "48px",
                            })}
                        />
                        <span className="text-sm text-muted-foreground flex-1">
                            Attached image
                        </span>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedAttachment(undefined)}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="flex items-center gap-2 justify-end">
                    <AttachmentPopover onSelect={setSelectedAttachment} />
                    <ButtonGroup orientation="horizontal">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-18"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            className="w-18"
                            disabled={
                                !content.trim() ||
                                isSubmitting ||
                                !currentUser ||
                                currentUser.banned
                            }
                        >
                            {isSubmitting ? "Posting..." : submitLabel}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </form>
    );
}
