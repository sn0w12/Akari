import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export function UpdatePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdatePassword = async (values: Record<string, unknown>) => {
        const password = values.password as string;
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            router.navigate({ to: "/account" });
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        Reset Your Password
                    </CardTitle>
                    <CardDescription>
                        Please enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form onFormSubmit={handleUpdatePassword}>
                        <div className="flex flex-col gap-6">
                            <Field name="password">
                                <FieldLabel>New password</FieldLabel>
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    required
                                />
                                <FieldError />
                            </Field>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save new password"}
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
