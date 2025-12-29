"use client";

import { useState, useEffect } from "react";
import { SECONDARY_ACCOUNTS } from "@/lib/auth/secondary-accounts";
import { logOut } from "@/lib/auth/akari";
import LoggedInView from "./account/logged-in-view";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";

export default function AccountClient() {
    const [savedUsername, setSavedUsername] = useState("");
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/auth/login");
            return;
        }
        queueMicrotask(() => {
            setSavedUsername(user.displayName);
        });
    }, [router, user, isLoading]);

    const handleLogout = async () => {
        await logOut(SECONDARY_ACCOUNTS);
        router.push("/");
    };

    if (savedUsername) {
        return (
            <LoggedInView
                savedUsername={savedUsername}
                handleLogout={handleLogout}
            />
        );
    } else {
        return <span>Redirecting...</span>;
    }
}
