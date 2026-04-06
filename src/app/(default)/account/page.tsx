import {
    AccountBody,
    AccountBodySkeleton,
} from "@/components/account/account-body";
import { PageWrapper } from "@/components/page-wrapper";
import { Suspense } from "react";

export default async function AccountPage() {
    return (
        <PageWrapper>
            <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
                <div className="mb-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Account
                    </h1>
                </div>

                <Suspense fallback={<AccountBodySkeleton />}>
                    <AccountBody />
                </Suspense>
            </div>
        </PageWrapper>
    );
}
