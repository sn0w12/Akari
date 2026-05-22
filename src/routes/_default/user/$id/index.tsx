import ErrorPage from "@/components/error-page";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { client, serverHeaders } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import { getAuthToken } from "@/lib/auth/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_VARIANT_MAP } from "@/components/user/users-header";
import { Separator } from "@/components/ui/separator";
import { UserListsSkeleton } from "@/components/user/user-lists-skeleton";
import { UserLists } from "@/components/user/user-lists";

const loadUserPage = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data: userId }) => {
        const token = await getAuthToken();

        const headers = {
            ...serverHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [userResponse, listsResponse] = await Promise.all([
            client.GET("/v2/user/{userId}", {
                params: { path: { userId } },
                headers,
            }),
            client.GET("/v2/lists/user/{userId}", {
                params: { path: { userId }, query: { page: 1, pageSize: 12 } },
                headers,
            }),
        ]);

        return {
            user: userResponse.data?.data ?? null,
            userError: userResponse.error ?? null,
            lists: listsResponse.data ?? null,
        };
    });

export const Route = createFileRoute("/_default/user/$id/")({
    loader: async ({ params }) => loadUserPage({ data: params.id }),
    component: UserPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 5 })
            .staleWhileRevalidate({ minutes: 30 })
            .public()
            .build(),
    }),
});

function UserPage() {
    const { user, userError, lists } = Route.useLoaderData();
    const { id } = Route.useParams();

    if (userError) return <ErrorPage error={userError} />;
    if (!user) return null;

    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col md:flex-row items-baseline md:gap-2">
                    <div className="flex flex-row gap-2 items-baseline">
                        <Avatar name={user.username} />
                        <h2 className="text-4xl font-semibold">
                            {user.displayName || user.username}
                        </h2>
                    </div>
                    <div className="flex flex-row gap-2 items-baseline">
                        <p className="text-muted-foreground leading-right">
                            @{user.username}
                        </p>
                        {user.banned ? (
                            <Badge variant="destructive">Banned</Badge>
                        ) : null}
                        {user.role !== "user" ? (
                            <Badge variant={ROLE_VARIANT_MAP[user.role]}>
                                {capitalize(user.role)}
                            </Badge>
                        ) : null}
                    </div>
                </div>
                <p className="text-foreground/75 text-sm">
                    {user.totalBookmarks} bookmarks &bull; {user.totalComments}{" "}
                    comments
                </p>
            </div>
            <Separator className="my-2" />
            <Suspense fallback={<UserListsSkeleton />}>
                <UserLists
                    userId={id}
                    initialData={
                        lists ?? {
                            result: "Success" as const,
                            status: 200 as const,
                            data: {
                                items: [],
                                totalItems: 0,
                                currentPage: 1,
                                pageSize: 12,
                                totalPages: 0,
                            },
                        }
                    }
                />
            </Suspense>
        </div>
    );
}
