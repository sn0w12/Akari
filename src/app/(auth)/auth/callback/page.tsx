import { Suspense } from "react";
import CallbackPage from "@/components/callback";
import Spinner from "@/components/ui/puff-loader";

export default function Callback() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense
                fallback={
                    <div className="min-h-screen">
                        <Spinner />
                    </div>
                }
            >
                <CallbackPage />
            </Suspense>
        </div>
    );
}
