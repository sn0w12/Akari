"use client";

import { useRouter } from "next/navigation";
import { useSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";
import { useEffect } from "react";

export default function PWAPage() {
    const router = useRouter();
    const pwaRestorePath = useSetting("pwaRestorePath");
    const pwaLastPageStorage = useStorage("pwaLastPage");

    useEffect(() => {
        if (pwaRestorePath) {
            try {
                const data = pwaLastPageStorage.get();
                const lastPage = data?.path;
                console.log("Restoring PWA to last page:", lastPage);
                if (lastPage) {
                    router.replace(lastPage);
                } else {
                    router.replace("/");
                }
            } catch {
                router.replace("/");
            }
        }
    }, [pwaRestorePath, pwaLastPageStorage, router]);

    return <div className="h-screen w-full bg-background" />;
}
