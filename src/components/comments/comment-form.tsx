"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            setContent("");
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (displayName: string) => {
        return displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                <AvatarFallback className="text-xs">
                    {getInitials(currentUser?.displayName || "")}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[80px] resize-none text-sm sm:text-base"
                    autoFocus={autoFocus}
                    disabled={isSubmitting || !currentUser}
                />

                <div className="flex items-center gap-2 justify-end">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={
                            !content.trim() || isSubmitting || !currentUser
                        }
                    >
                        {isSubmitting ? "Posting..." : submitLabel}
                    </Button>
                </div>
            </div>
        </form>
    );
}
