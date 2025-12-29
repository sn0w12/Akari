import { client, serverHeaders } from "@/lib/api";
import { createClient as createSupabaseClient } from "@/lib/auth/server";
import { ConnectedAccounts } from "./connected-accounts";
import { UserMangaLists } from "./lists";
import { UserProfile } from "./user-profile";
import { redirect } from "next/navigation";
import ErrorPage from "@/components/error-page";

import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

async function getAccountData(accessToken: string) {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        ...serverHeaders,
    };

    const [userRes, listsRes] = await Promise.all([
        client.GET("/v2/user/me", { headers }),
        client.GET("/v2/lists/user/me", {
            params: {
                query: {
                    pageSize: 100,
                },
            },
            headers,
        }),
    ]);

    return { userRes, listsRes };
}

export async function AccountBody() {
    const supabase = await createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) {
        redirect("/auth/login");
    }

    const { userRes, listsRes } = await getAccountData(accessToken);

    if (userRes.error) {
        if (userRes.error.status === 401) {
            redirect("/auth/login");
        }

        return <ErrorPage error={userRes.error} />;
    }

    const lists = listsRes.error ? [] : listsRes.data?.data?.items || [];

    return (
        <div className="space-y-4">
            <UserProfile user={userRes.data.data} />
            <ConnectedAccounts />
            <UserMangaLists initialLists={lists} />
        </div>
    );
}

export async function AccountBodySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-4">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                        Your Manga Lists
                    </h2>
                    <Button variant="outline" disabled>
                        Create List
                    </Button>
                </div>
            </div>
        </div>
    );
}
