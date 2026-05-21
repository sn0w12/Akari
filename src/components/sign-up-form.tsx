import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Fieldset } from "@/components/ui/fieldset";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Providers } from "./auth/oauth";

export function SignUpForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (values: Record<string, unknown>) => {
        const email = values.email as string;
        const userName = (values.username as string).toLowerCase();
        const displayName = values.displayName as string;
        const password = values.password as string;
        const repeatPassword = values.repeatPassword as string;

        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/account`,
                    data: {
                        username: userName,
                        display_name: displayName,
                    },
                },
            });
            if (error) throw error;
            router.navigate({ to: "/auth/sign-up-success" });
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
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>Create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form onFormSubmit={handleSignUp}>
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
                            <Field name="username">
                                <FieldLabel>Username</FieldLabel>
                                <Input placeholder="username" required />
                                <FieldError />
                            </Field>
                            <Field name="displayName">
                                <FieldLabel>Display Name</FieldLabel>
                                <Input placeholder="Display Name" required />
                                <FieldError />
                            </Field>
                            <Fieldset>
                                <div className="flex flex-col gap-4">
                                    <Field name="password">
                                        <FieldLabel>Password</FieldLabel>
                                        <Input type="password" required />
                                        <FieldError />
                                    </Field>
                                    <Field name="repeatPassword">
                                        <FieldLabel>Repeat Password</FieldLabel>
                                        <Input type="password" required />
                                        <FieldError />
                                    </Field>
                                </div>
                            </Fieldset>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Creating an account..."
                                    : "Sign up"}
                            </Button>
                            <Providers />
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
        </div>
    );
}
