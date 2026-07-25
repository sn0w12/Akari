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
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const router = useRouter();

    const handleLogin = async (values: Record<string, unknown>) => {
        const identifier = values.identifier as string;
        const password = values.password as string;

        startTransition(async () => {
            setError(null);

            try {
                const isEmail = identifier.includes("@");
                const result = isEmail
                    ? await signIn.email({
                          email: identifier,
                          password,
                      })
                    : await signIn.username({
                          username: identifier.toLowerCase(),
                          password,
                      });

                if (result.error) throw result.error;
                void queryClient.invalidateQueries({ queryKey: ["user"] });
                void router.navigate({ to: "/account" });
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
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email or username below to login to your
                        account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form onFormSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <Field name="identifier">
                                <FieldLabel>Email or Username</FieldLabel>
                                <Input
                                    type="text"
                                    placeholder="m@example.com"
                                    required
                                    autoComplete="username webauthn"
                                />
                                <FieldError />
                            </Field>
                            <Field name="password">
                                <div className="flex items-center w-full justify-between">
                                    <FieldLabel>Password</FieldLabel>
                                    <Link
                                        to="/auth/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    required
                                    autoComplete="current-password webauthn"
                                />
                                <FieldError />
                            </Field>
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending}
                            >
                                {isPending ? "Logging in..." : "Login"}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/auth/sign-up"
                                className="underline underline-offset-4"
                            >
                                Sign up
                            </Link>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
