import { Suspense } from "react";
import FallbackPage from "@/components/FallbackPage";
import CallbackPage from "@/components/Callback";

export default function Callback() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<FallbackPage />}>
                <CallbackPage />
            </Suspense>
        </div>
    );
}
