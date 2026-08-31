import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ButtonGroup } from "../ui/group";

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
    currentUser,
}: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: Record<string, unknown>) => {
        const content = values.content as string;
        if (!content?.trim() || isSubmitting) return;

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

    return (
        <Form onFormSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <Avatar name={currentUser?.username || ""} />
            <div className="flex-1 space-y-2">
                <Field name="content">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[80px] resize-none text-base"
                        disabled={
                            isSubmitting || !currentUser || currentUser.banned
                        }
                    />
                    <FieldError />
                </Field>

                <div className="flex items-center gap-2 justify-end">
                    <ButtonGroup orientation="horizontal">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-24 md:w-18"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            className="w-24 md:w-18"
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
        </Form>
    );
}
