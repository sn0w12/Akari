"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "pwa_last_page";
const SESSION_KEY = "pwa_session_restored";

export function PWANavigationRestore() {
    const pathname = usePathname();
    const router = useRouter();
    const hasRestoredRef = useRef(false);

    useEffect(() => {
        const isPWA = () => {
            return (
                window.matchMedia("(display-mode: standalone)").matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes("android-app://")
            );
        };

        if (!isPWA()) {
            return;
        }

        const isNewSession = !sessionStorage.getItem(SESSION_KEY);
        if (isNewSession && !hasRestoredRef.current) {
            hasRestoredRef.current = true;
            sessionStorage.setItem(SESSION_KEY, "true");

            try {
                const lastPage = localStorage.getItem(STORAGE_KEY);

                if (lastPage && pathname === "/") {
                    router.replace(lastPage);
                    return; // Don't save "/" if we're restoring
                }
            } catch (error) {
                console.error("Failed to restore last page:", error);
            }
        }

        // Save current page whenever it changes
        try {
            localStorage.setItem(STORAGE_KEY, pathname);
        } catch (error) {
            console.error("Failed to save current page:", error);
        }
    }, [pathname, router]);

    return null;
}
