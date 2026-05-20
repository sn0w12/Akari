import { AccountBody } from "@/components/account/account-body";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/account/")({
    component: AccountPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .noCache()
            .private()
            .build(),
    }),
});

function AccountPage() {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
            <div className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Account
                </h1>
            </div>
            <AccountBody />
        </div>
    );
}
