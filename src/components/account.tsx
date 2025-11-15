"use client";

import { useState, useEffect } from "react";
import {
    SecondaryAccount,
    SECONDARY_ACCOUNTS,
} from "@/lib/auth/secondary-accounts";
import { logOut } from "@/lib/auth/akari";
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
    }, [user]);

    const handleLogout = async () => {
        await logOut(secondaryAccounts);
        router.push("/");
    };

    if (isLoading) {
        return;
    }

    if (savedUsername) {
        return (
            <LoggedInView
                secondaryAccounts={secondaryAccounts}
                savedUsername={savedUsername}
                handleLogout={handleLogout}
            />
        );
    } else {
        return <span>Redirecting...</span>;
    }
}
