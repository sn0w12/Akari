import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import CallbackPage from "@/components/callback";

export const Route = createFileRoute("/_auth/auth/callback")({
    component: Callback,
});

function Callback() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={null}>
                <CallbackPage />
            </Suspense>
        </div>
    );
}
