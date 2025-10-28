"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "../ui/puff-loader";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const formSchema = z.object({
    email: z.email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

interface LoginViewProps {
    loginError: string;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export default function LoginView({
    loginError,
    isLoading,
    onSubmit,
}: LoginViewProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="mx-auto px-4 py-1 max-w-md">
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Spinner />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Login to Akari</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Email..."
                                                    className="touch-manipulation"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Password..."
                                                        className="touch-manipulation pr-10"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                        aria-label={
                                                            showPassword
                                                                ? "Hide password"
                                                                : "Show password"
                                                        }
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {loginError && (
                                    <p className="text-red-500 text-sm">
                                        {loginError}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full touch-manipulation"
                                >
                                    Login
                                </Button>

                                <div className="text-center pt-2">
                                    <Link
                                        href="/register"
                                        className="text-blue-500 hover:text-blue-400 text-sm"
                                    >
                                        Don&apos;t have an account? Register
                                        here
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
