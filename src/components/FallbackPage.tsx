"use client";

import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";

export default function FallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <CenteredSpinner />
        </div>
    );
}
