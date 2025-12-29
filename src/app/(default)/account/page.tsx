import { client, serverHeaders } from "@/lib/api";
import { createClient as createSupabaseClient } from "@/lib/auth/server";
import { UserProfile } from "@/components/account/user-profile";
import { ConnectedAccounts } from "@/components/account/connected-accounts";
import { UserMangaLists } from "@/components/account/lists";
import { redirect } from "next/navigation";
import ErrorPage from "@/components/error-page";

export default async function AccountPage() {
    const supabase = await createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const headers = {
        Authorization: `Bearer ${session?.access_token}`,
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

    if (userRes.error) {
        if (userRes.error.status === 401) {
            redirect("/auth/login");
        }

        return <ErrorPage error={userRes.error} />;
    }

    const lists = listsRes.error ? [] : listsRes.data?.data?.items || [];

    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 h-full">
            <div className="mb-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Account
                </h1>
            </div>

            <div className="space-y-4">
                <UserProfile user={userRes.data.data} />
                <ConnectedAccounts />
                <UserMangaLists initialLists={lists} />
            </div>
        </div>
    );
}
