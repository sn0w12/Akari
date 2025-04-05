"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MangaPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting to homepage...</p>
        </div>
    );
}
