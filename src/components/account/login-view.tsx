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

export const formSchema = z.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters." }),
    password: z.string().min(1, { message: "Password is required." }),
    captcha: z.string().min(1, { message: "CAPTCHA is required." }),
});

interface LoginViewProps {
    captchaUrl: string;
    sessionCookies: string[];
    loginError: string;
    isLoading: boolean;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    handleFetchCaptcha: () => void;
}

export default function LoginView({
    captchaUrl,
    loginError,
    isLoading,
    onSubmit,
}: LoginViewProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "", captcha: "" },
    });

    return (
        <div className="mx-auto px-4 py-1 max-w-md">
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Spinner />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Login to Manganato</CardTitle>
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
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Username..."
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
                                                <Input
                                                    type="password"
                                                    placeholder="Password..."
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
                                    name="captcha"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CAPTCHA</FormLabel>
                                            <div className="flex items-center w-full">
                                                {!captchaUrl ? (
                                                    <div className="w-[100px] h-[45px] mr-2 flex-shrink-0">
                                                        <Skeleton className="w-full h-full" />
                                                    </div>
                                                ) : (
                                                    <div className="w-[100px] h-[45px] mr-2 flex-shrink-0 content-center">
                                                        <Image
                                                            src={captchaUrl}
                                                            loading="eager"
                                                            alt="CAPTCHA"
                                                            className="object-contain"
                                                            width={100}
                                                            height={45}
                                                        />
                                                    </div>
                                                )}
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter CAPTCHA..."
                                                        className="touch-manipulation"
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </div>
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
