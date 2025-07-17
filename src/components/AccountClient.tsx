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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon } from "lucide-react";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMalAuth, isAccountValid } from "@/lib/secondaryAccounts";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { SecondaryAccount, SECONDARY_ACCOUNTS } from "@/lib/secondaryAccounts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReadingHistory from "@/components/ui/Account/ReadingHistory";
import { useRouter, useSearchParams } from "next/navigation";
import {
    fetchCaptcha,
    submitLogin,
    logout,
    logoutSecondaryAccount,
} from "@/lib/auth";

const formSchema = z.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters." }),
    password: z.string().min(1, { message: "Password is required." }),
    captcha: z.string().min(1, { message: "CAPTCHA is required." }),
});

export default function AccountClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [secondaryAccounts, setSecondaryAccounts] =
        useState<SecondaryAccount[]>(SECONDARY_ACCOUNTS);
    const [loading, setLoading] = useState(true);
    const [savedUsername, setSavedUsername] = useState("");
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [token, setToken] = useState("");
    const [sessionCookies, setSessionCookies] = useState([""]);
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState<string>("account");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "", captcha: "" },
    });

    const handleFetchCaptcha = async () => {
        if (captchaUrl && sessionCookies.length > 0) {
            return;
        }

        try {
            const {
                captchaUrl: url,
                sessionCookies: cookies,
                token: newToken,
            } = await fetchCaptcha();
            setCaptchaUrl(url);
            setSessionCookies(cookies);
            setToken(newToken);
        } catch {
            setLoginError("Failed to fetch CAPTCHA.");
        }
    };

    useEffect(() => {
        // Check if user is logged in
        const accountName = localStorage.getItem("accountName");
        if (accountName) {
            try {
                const decodedAccountName = decodeURIComponent(accountName);
                setSavedUsername(decodedAccountName);

                // Set active tab from URL parameter if available and valid
                if (
                    tabParam &&
                    ["account", "connections", "history"].includes(tabParam)
                ) {
                    setActiveTab(tabParam);
                }
            } catch (error) {
                console.error("Failed to parse user_acc cookie:", error);
            }
        }
        setLoading(false);

        // Check secondary accounts
        const checkSecondaryAuth = async () => {
            const updatedAccounts = await Promise.all(
                secondaryAccounts.map(async (account) => {
                    const userData = JSON.parse(
                        localStorage.getItem(account.storageKey) || "{}",
                    );
                    if (userData.name && (await isAccountValid(account))) {
                        return { ...account, user: userData };
                    }

                    if (account.id === "mal") {
                        return generateMalAuth(account);
                    }

                    return account;
                }),
            );
            setSecondaryAccounts(updatedAccounts);
        };

        checkSecondaryAuth();

        // If not logged in, fetch captcha for login form
        if (!accountName) {
            handleFetchCaptcha();
        }
    }, []);

    const handleLogout = async () => {
        await logout(secondaryAccounts);
        setSavedUsername("");
        window.location.reload();
    };

    const handleSecondaryLogout = async (account: SecondaryAccount) => {
        await logoutSecondaryAccount(account);
        setSecondaryAccounts((accounts) =>
            accounts.map((acc) =>
                acc.id === account.id ? { ...acc, user: null } : acc,
            ),
        );
        window.location.reload();
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const response = await submitLogin(
                values.username,
                values.password,
                values.captcha,
                token,
                sessionCookies,
            );
            if (response.success) {
                setSavedUsername(values.username);
                window.location.reload();
            } else {
                setLoginError(response.error || "Login failed");
            }
        } catch {
            setLoginError("An error occurred during login.");
        }

        setIsLoading(false);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/account?tab=${value}`, { scroll: false });
    };

    if (loading) {
        return;
    }

    // Logged in view
    if (savedUsername) {
        return (
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-2"
            >
                <TabsList className="flex flex-wrap h-auto gap-2 w-full justify-center md:justify-start p-2 bg-transparent rounded-lg border">
                    <TabsTrigger
                        value="account"
                        className="data-[state=active]:bg-accent rounded-md px-3 py-1.5 hover:bg-accent/70 flex-shrink-0"
                    >
                        Primary Account
                    </TabsTrigger>
                    <TabsTrigger
                        value="connections"
                        className="data-[state=active]:bg-accent rounded-md px-3 py-1.5 hover:bg-accent/70 flex-shrink-0"
                    >
                        Connected Services
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="data-[state=active]:bg-accent rounded-md px-3 py-1.5 hover:bg-accent/70 flex-shrink-0"
                    >
                        Reading History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Manage your primary Manganato account settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-gray-500">
                                        Username
                                    </span>
                                    <span className="text-xl font-bold">
                                        {savedUsername}
                                    </span>
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-gray-500">
                                        Account Type
                                    </span>
                                    <span className="text-md">Manganato</span>
                                </div>

                                <div className="pt-4 border-t mt-6">
                                    <ConfirmDialog
                                        triggerButton={
                                            <Button variant="destructive">
                                                Logout from all accounts
                                            </Button>
                                        }
                                        title="Confirm Logout"
                                        message="Are you sure you want to logout from all accounts? This will also disconnect all linked services."
                                        confirmLabel="Logout"
                                        confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                        cancelLabel="Cancel"
                                        onConfirm={handleLogout}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="connections" className="space-y-6">
                    {secondaryAccounts.map((account) => (
                        <Card key={account.id}>
                            <CardHeader>
                                <CardTitle>{account.name}</CardTitle>
                                <CardDescription>
                                    {account.user
                                        ? `Connected to your ${account.name} account`
                                        : `Connect your ${account.name} account to sync your manga list`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.authUrl && !account.user && (
                                    <div className="space-y-4">
                                        <Link href={account.authUrl}>
                                            <Button
                                                className={`flex items-center gap-2 ${account.buttonColor} ${account.hoverColor}`}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                                Connect {account.name}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                {account.user && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">
                                                    Username
                                                </span>
                                                <span className="text-xl font-bold">
                                                    {account.user.name}
                                                </span>
                                            </div>
                                            <p className="text-accent-color flex items-center gap-1">
                                                <span className="inline-block w-2 h-2 rounded-full bg-accent-color"></span>
                                                Connected
                                            </p>
                                        </div>
                                        <ConfirmDialog
                                            triggerButton={
                                                <Button
                                                    variant="outline"
                                                    className="bg-red-500 hover:bg-red-400"
                                                >
                                                    Disconnect
                                                </Button>
                                            }
                                            title="Disconnect Account"
                                            message={`Are you sure you want to disconnect your ${account.name} account? This will stop syncing your manga data.`}
                                            confirmLabel="Disconnect"
                                            confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                            cancelLabel="Cancel"
                                            onConfirm={() =>
                                                handleSecondaryLogout(account)
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <ReadingHistory />
            </Tabs>
        );
    }

    // Login form (not logged in)
    return (
        <div className="mx-auto px-4 py-1 max-w-md">
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <CenteredSpinner />
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
