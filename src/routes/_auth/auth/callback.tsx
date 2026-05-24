import CallbackPage from "@/components/callback";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/auth/callback")({
    component: Callback,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder().noCache().build(),
    }),
});

function Callback() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <CallbackPage />
        </div>
    );
}
