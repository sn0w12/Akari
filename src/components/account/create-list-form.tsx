import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface CreateListFormProps {
    onSuccess: (list: components["schemas"]["UserMangaListResponse"]) => void;
    onClose: () => void;
}

export function CreateListForm({ onSuccess, onClose }: CreateListFormProps) {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(values: Record<string, unknown>) {
        const title = values.title as string;
        if (!title?.trim()) return;

        startTransition(async () => {
            const { data, error } = await client.POST("/v2/lists", {
                body: {
                    title,
                    description: (values.description as string) ?? "",
                    isPublic: !!values.isPublic,
                },
            });

            if (error) {
                toastManager.add({
                    title: "Failed to create list",
                    type: "error",
                });
            } else {
                toastManager.add({
                    title: "List created successfully",
                    type: "success",
                });
                onSuccess(data.data);
            }
        });
    }

    return (
        <Form onFormSubmit={handleSubmit} className="space-y-4">
            <Field name="title">
                <FieldLabel>Title *</FieldLabel>
                <Input required />
                <FieldError />
            </Field>
            <Field name="description">
                <FieldLabel>Description</FieldLabel>
                <Textarea style={{ resize: "none" }} />
            </Field>
            <Field name="isPublic">
                <div className="flex items-center gap-x-2">
                    <Checkbox />
                    <FieldLabel>Public</FieldLabel>
                </div>
            </Field>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create"}
                </Button>
            </div>
        </Form>
    );
}
