import { Suspense } from "react";
import {
    AccountBody,
    AccountBodySkeleton,
} from "@/components/account/account-body";

export default async function AccountPage() {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 h-full">
            <div className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Account
                </h1>
            </div>

            <Suspense fallback={<AccountBodySkeleton />}>
                <AccountBody />
            </Suspense>
        </div>
    );
}
