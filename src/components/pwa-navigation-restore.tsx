"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDevice } from "@/contexts/device-context";
import { useSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";

export function PWANavigationRestore() {
    const pathname = usePathname();
    const router = useRouter();
    const hasRestoredRef = useRef(false);
    const pwaRestorePath = useSetting("pwaRestorePath");
    const { isPWA } = useDevice();
    const pwaLastPageStorage = useStorage("pwaLastPage");
    const pwaSessionStorage = useStorage("pwaSessionRestored");

    useEffect(() => {
        if (!isPWA || !pwaRestorePath) {
            return;
        }

        const isNewSession = !pwaSessionStorage.get()?.restored;
        if (isNewSession && !hasRestoredRef.current) {
            hasRestoredRef.current = true;
            pwaSessionStorage.set({ restored: true });

            try {
                const data = pwaLastPageStorage.get();
                const lastPage = data?.path;

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
            pwaLastPageStorage.set({ path: pathname });
        } catch (error) {
            console.error("Failed to save current page:", error);
        }
    }, [pathname, router]);

    return null;
}
