import ErrorPage from "@/components/error-page";
import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AccountActions } from "./account-actions";
import { ConnectedAccounts } from "./connected-accounts";
import { UserMangaLists } from "./lists";
import { PasskeySection } from "./passkeys";
import { UserProfile } from "./user-profile";
import { useUser } from "@/hooks/use-user";

export function AccountBody() {
    const { data: user } = useUser();
    const { data, error, isLoading } = useQuery({
        queryKey: ["account"],
        queryFn: async () => {
            const { data } = await client.GET("/v2/lists/user/me", {
                params: { query: { pageSize: 100 } },
            });

            return {
                lists: data?.data?.items || [],
            };
        },
        retry: false,
    });

    if (isLoading) return <AccountBodySkeleton />;
    if (error)
        return (
            <ErrorPage
                error={
                    error as unknown as components["schemas"]["ErrorResponse"]
                }
            />
        );
    if (!user || !data) return null;

    return (
        <div className="space-y-4">
            <UserProfile user={user} />
            <AccountActions user={user} />
            <PasskeySection />
            <ConnectedAccounts />
            <UserMangaLists initialLists={data.lists} />
        </div>
    );
}

export function AccountBodySkeleton() {
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
