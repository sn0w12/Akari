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
import { requestPasswordReset } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleForgotPassword = async (values: Record<string, unknown>) => {
        const email = values.email as string;
        startTransition(async () => {
            setError(null);

            try {
                const { error } = await requestPasswordReset({
                    email,
                    redirectTo: `${window.location.origin}/auth/update-password`,
                });
                if (error) throw error;
                setSuccess(true);
            } catch (error: unknown) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {success ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Check Your Email
                        </CardTitle>
                        <CardDescription>
                            Password reset instructions sent
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            If you registered using your email and password, you
                            will receive a password reset email.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Reset Your Password
                        </CardTitle>
                        <CardDescription>
                            Type in your email and we&apos;ll send you a link to
                            reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form onFormSubmit={handleForgotPassword}>
                            <div className="flex flex-col gap-6">
                                <Field name="email">
                                    <FieldLabel>Email</FieldLabel>
                                    <Input
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                    <FieldError />
                                </Field>
                                {error && (
                                    <p className="text-sm text-red-500">
                                        {error}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isPending}
                                >
                                    {isPending
                                        ? "Sending..."
                                        : "Send reset email"}
                                </Button>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <Link
                                    to="/auth/login"
                                    className="underline underline-offset-4"
                                >
                                    Login
                                </Link>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
