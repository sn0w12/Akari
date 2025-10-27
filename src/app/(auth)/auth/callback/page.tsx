import { Suspense } from "react";
import CallbackPage from "@/components/callback";

export default function Callback() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={null}>
                <CallbackPage />
            </Suspense>
        </div>
    );
}
