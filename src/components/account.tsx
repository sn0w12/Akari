"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import {
    generateMalAuth,
    isAccountValid,
    SecondaryAccount,
    SECONDARY_ACCOUNTS,
} from "@/lib/auth/secondary-accounts";
import {
    fetchCaptcha,
    submitLogin,
    logout,
    logoutSecondaryAccount,
} from "@/lib/auth/manganato";
import LoggedInView from "./account/logged-in-view";
import LoginView from "./account/login-view";
import { formSchema } from "./account/login-view";

export default function AccountClient() {
    const [secondaryAccounts, setSecondaryAccounts] =
        useState<SecondaryAccount[]>(SECONDARY_ACCOUNTS);
    const [loading, setLoading] = useState(true);
    const [savedUsername, setSavedUsername] = useState("");
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [sessionCookies, setSessionCookies] = useState([""]);
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFetchCaptcha = async () => {
        if (captchaUrl && sessionCookies.length > 0) {
            return;
        }

        try {
            const { captchaUrl: url, cookies: newCookies } =
                await fetchCaptcha();
            setCaptchaUrl(url);
            setSessionCookies(newCookies);
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
                        localStorage.getItem(account.storageKey) || "{}"
                    );
                    if (userData.name && (await isAccountValid(account))) {
                        return { ...account, user: userData };
                    }

                    if (account.id === "mal") {
                        return generateMalAuth(account);
                    }

                    return account;
                })
            );
            setSecondaryAccounts(updatedAccounts);
        };

        checkSecondaryAuth();

        // If not logged in, fetch captcha for login form
        if (!accountName) {
            handleFetchCaptcha();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                acc.id === account.id ? { ...acc, user: null } : acc
            )
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
                sessionCookies
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

    if (loading) {
        return;
    }

    if (savedUsername) {
        return (
            <LoggedInView
                secondaryAccounts={secondaryAccounts}
                setSecondaryAccounts={setSecondaryAccounts}
                savedUsername={savedUsername}
                handleLogout={handleLogout}
                handleSecondaryLogout={handleSecondaryLogout}
            />
        );
    } else {
        return (
            <LoginView
                captchaUrl={captchaUrl}
                sessionCookies={sessionCookies}
                loginError={loginError}
                isLoading={isLoading}
                onSubmit={onSubmit}
                handleFetchCaptcha={handleFetchCaptcha}
            />
        );
    }
}
