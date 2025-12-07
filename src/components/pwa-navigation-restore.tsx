"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDevice } from "@/contexts/device-context";
import { useSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";

export function PWANavigationRestore() {
    const pathname = usePathname();
    const router = useRouter();
    const pwaRestorePath = useSetting("pwaRestorePath");
    const pwaLastPageStorage = useStorage("pwaLastPage");
    const { isPWA } = useDevice();

    useEffect(() => {
        if (!isPWA || !pwaRestorePath) {
            return;
        }

        try {
            pwaLastPageStorage.set({ path: pathname });
        } catch (error) {
            console.error("Failed to save current page:", error);
        }
    }, [isPWA, pathname, pwaLastPageStorage, pwaRestorePath, router]);

    return null;
}
