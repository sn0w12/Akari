"use client";

import { useState, useEffect } from "react";
import {
    generateMalAuth,
    isAccountValid,
    SecondaryAccount,
    SECONDARY_ACCOUNTS,
    SecondaryAccountId,
} from "@/lib/auth/secondary-accounts";
import { logout, logoutSecondaryAccount } from "@/lib/auth/manganato";
import LoggedInView from "./account/logged-in-view";
import { useRouter } from "next/navigation";

export default function AccountClient() {
    const [secondaryAccounts, setSecondaryAccounts] =
        useState<SecondaryAccount[]>(SECONDARY_ACCOUNTS);
    const [loading, setLoading] = useState(true);
    const [savedUsername, setSavedUsername] = useState("");
    const router = useRouter();

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
        } else {
            // Not logged in, redirect to login page
            router.push("/login");
            return;
        }
        setLoading(false);

        // Check secondary accounts
        const checkSecondaryAuth = async () => {
            const updatedAccounts = await Promise.all(
                secondaryAccounts.map(async (account) => {
                    const userData = JSON.parse(
                        localStorage.getItem(account.storageKey) || "{}"
                    );
                    if (
                        userData.name &&
                        (await isAccountValid(account.id as SecondaryAccountId))
                    ) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = () => {
        logout(secondaryAccounts);
        setSavedUsername("");
        window.location.reload();
    };

    const handleSecondaryLogout = (account: SecondaryAccount) => {
        logoutSecondaryAccount(account);
        setSecondaryAccounts((accounts) =>
            accounts.map((acc) =>
                acc.id === account.id ? { ...acc, user: null } : acc
            )
        );
        window.location.reload();
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
        return <span>Redirecting...</span>;
    }
}
