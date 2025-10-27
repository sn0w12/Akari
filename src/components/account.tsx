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
import { useUser } from "@/contexts/user-context";

export default function AccountClient() {
    const [secondaryAccounts, setSecondaryAccounts] =
        useState<SecondaryAccount[]>(SECONDARY_ACCOUNTS);
    const [savedUsername, setSavedUsername] = useState("");
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }
        setSavedUsername(user.displayName);

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
    }, [user]);

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

    if (isLoading) {
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
