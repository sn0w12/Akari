"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";

const NO_RESTORE_PATHS = ["/pwa", "/pwa/", "/", ""];
export function PWANavigationRestore() {
    const pathname = usePathname();
    const router = useRouter();
    const pwaRestorePath = useSetting("pwaRestorePath");
    const pwaLastPageStorage = useStorage("pwaLastPage");

    useEffect(() => {
        if (!pwaRestorePath || NO_RESTORE_PATHS.includes(pathname)) {
            return;
        }

        try {
            pwaLastPageStorage.set({ path: pathname });
        } catch (error) {
            console.error("Failed to save current page:", error);
        }
    }, [pathname, pwaLastPageStorage, pwaRestorePath, router]);

    return null;
}
