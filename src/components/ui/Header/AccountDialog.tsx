"use client";

import { useEffect, useState, Suspense, useCallback, forwardRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import React from "react";
import Image from "next/image";
import db from "@/lib/db";
import { Skeleton } from "../skeleton";
import { generateMalAuth } from "@/lib/secondaryAccounts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isAccountValid } from "@/lib/secondaryAccounts";

export interface SecondaryAccount {
    id: string;
    name: string;
    displayName: string;
    user: any | null;
    authUrl?: string;
    buttonColor: string;
    hoverColor: string;
    storageKey: string;
    sessionKey: string;
    apiEndpoint: string;
    validateEndpoint: string;
}

export const SECONDARY_ACCOUNTS: SecondaryAccount[] = [
    {
        id: "mal",
        name: "MyAnimeList",
        displayName: "MAL",
        user: null,
        buttonColor: "bg-blue-600",
        hoverColor: "hover:bg-blue-500",
        storageKey: "mal_user",
        sessionKey: "mal",
        apiEndpoint: "/api/logout/mal",
        validateEndpoint: "/api/mal/isLoggedIn",
    },
];

function AccountParamChecker({
    onAccountParam,
}: {
    onAccountParam: () => void;
}) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const hasAccountParam = searchParams.get("account") === "true";
        if (hasAccountParam) {
            onAccountParam();
        }
    }, [searchParams, onAccountParam]);

    return null;
}

function DialogButtonContent() {
    return (
        <>
            <User className="h-5 w-5" />
            <span className="text-base font-medium">Account</span>
        </>
    );
}

const LoginDialog = forwardRef<HTMLButtonElement>((props, ref) => {
    const [secondaryAccounts, setSecondaryAccounts] =
        useState<SecondaryAccount[]>(SECONDARY_ACCOUNTS);
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [savedUsername, setSavedUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleAccountParam = useCallback(() => {
        setTimeout(() => {
            setOpen(true);
        }, 500);
    }, []);

    useEffect(() => {
        const accountName = localStorage.getItem("accountName");
        if (accountName) {
            try {
                // Decode and parse the user_acc cookie value
                const decodedAccountName = decodeURIComponent(accountName);
                setSavedUsername(decodedAccountName);
            } catch (error) {
                console.error("Failed to parse user_acc cookie:", error);
            }
        }
    }, []);

    const handleLogout = async () => {
        // Manganato
        localStorage.removeItem("accountName");
        setUsername(""); // Reset username to trigger the login view again
        setSavedUsername("");

        secondaryAccounts.forEach((account) => {
            localStorage.removeItem(account.storageKey);
            sessionStorage.removeItem(account.sessionKey);
        });

        // Clear Caches
        db.clearCache(db.bookmarkCache);
        db.clearCache(db.mangaCache);
        db.clearCache(db.hqMangaCache);

        await fetch("/api/logout");
        window.location.reload();
    };

    const handleSecondaryLogout = async (account: SecondaryAccount) => {
        localStorage.removeItem(account.storageKey);
        sessionStorage.removeItem(account.sessionKey);
        setSecondaryAccounts((accounts) =>
            accounts.map((acc) =>
                acc.id === account.id ? { ...acc, user: null } : acc,
            ),
        );
        await fetch(account.apiEndpoint);
        window.location.reload();
    };

    // Submit login with CAPTCHA, username, and password
    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();
            if (data.success === true) {
                // Decode and parse the user_acc cookie value to update user data
                localStorage.setItem("accountName", data.data.username);
                setSavedUsername(data.data.username);

                window.location.reload();
            } else {
                setLoginError(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Failed to submit login:", error);
            setLoginError("An error occurred during login.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
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
    }, []);

    const renderSecondaryAccounts = () => (
        <>
            {secondaryAccounts.map((account) => (
                <div key={account.id}>
                    {account.authUrl && !account.user && (
                        <Link href={account.authUrl}>
                            <Button
                                variant="outline"
                                className={`mt-4 w-full ${account.buttonColor} ${account.hoverColor}`}
                            >
                                {account.name}
                            </Button>
                        </Link>
                    )}
                    {account.user && (
                        <div className="mt-4 flex items-center space-x-4 justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold">
                                    {account.user.name}
                                </h2>
                                <p className="mt-2">
                                    Logged In With {account.displayName}
                                </p>
                            </div>
                            <ConfirmDialog
                                triggerButton={
                                    <Button
                                        variant="outline"
                                        className="mt-2 bg-red-500 hover:bg-red-400"
                                    >
                                        Logout {account.displayName}
                                    </Button>
                                }
                                title="Confirm Logout"
                                message={`Are you sure you want to logout from ${account.name}?`}
                                confirmLabel="Logout"
                                confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                cancelLabel="Cancel"
                                onConfirm={() => handleSecondaryLogout(account)}
                            />
                        </div>
                    )}
                </div>
            ))}
        </>
    );

    // If user data exists, display the user's name and user data, otherwise show the login dialog
    if (savedUsername) {
        return (
            <>
                <Suspense>
                    <AccountParamChecker onAccountParam={handleAccountParam} />
                </Suspense>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            ref={ref}
                            variant="ghost"
                            size="icon"
                            className="flex w-full sm:w-auto flex-grow items-center gap-3 px-4 py-2 border rounded-md"
                        >
                            <DialogButtonContent />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Account Information</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-4 mb-4 border-t">
                            <div className="mt-4 w-full">
                                <h2 className="text-xl font-bold">
                                    {savedUsername}
                                </h2>
                                <p className="mt-2">Logged In With Manganato</p>
                                {renderSecondaryAccounts()}
                                {/* Logout Button */}
                                <ConfirmDialog
                                    triggerButton={
                                        <Button
                                            variant="outline"
                                            className="mt-4 w-full bg-red-600 hover:bg-red-500"
                                        >
                                            Logout
                                        </Button>
                                    }
                                    title="Confirm Logout"
                                    message="Are you sure you want to logout from all accounts?"
                                    confirmLabel="Logout"
                                    confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                    cancelLabel="Cancel"
                                    onConfirm={handleLogout}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // Show the login form if the user is not logged in
    return (
        <>
            <Suspense>
                <AccountParamChecker onAccountParam={handleAccountParam} />
            </Suspense>
            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        ref={ref}
                        variant="ghost"
                        size="icon"
                        className="flex w-full sm:w-auto border flex-grow items-center gap-2 px-6 py-5"
                    >
                        <DialogButtonContent />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    {isLoading && <CenteredSpinner />}
                    {!isLoading && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Login</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center space-x-4 mb-4 border-t">
                                <div className="mt-4 w-full">
                                    {/* Username Field */}
                                    <label className="block text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Username..."
                                        className="w-full"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                    />

                                    {/* Password Field */}
                                    <label className="block text-sm font-medium mb-2 mt-2">
                                        Password
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Password..."
                                        className="w-full"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        className="mt-4 w-full"
                                        onClick={handleSubmit}
                                    >
                                        Login
                                    </Button>

                                    {/* Register Link */}
                                    <div className="mt-2 text-center">
                                        <Link
                                            href="/register"
                                            className="text-sm text-blue-500 hover:text-blue-400"
                                            onClick={() => setOpen(false)}
                                        >
                                            Don't have an account? Register here
                                        </Link>
                                    </div>

                                    {/* Error Message */}
                                    {loginError && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {loginError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
});

LoginDialog.displayName = "LoginDialog";

export default LoginDialog;
