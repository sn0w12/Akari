import ErrorPage from "@/components/error-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROLE_VARIANT_MAP } from "@/components/user/users-header";
import { client, serverHeaders } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

export default async function UsersPage() {
    "use cache";
    cacheLife("hours");
    cacheTag("users");

    const { data, error } = await client.GET("/v2/user", {
        params: {
            query: {
                page: 1,
                pageSize: 100,
                sortBy: "TotalBookmarks",
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold mb-2">Users</h2>
            </div>

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {data?.data.items.map((user) => (
                    <UserCard key={user.userId} user={user} />
                ))}
            </div>
        </div>
    );
}

async function UserCard({
    user,
}: {
    user: components["schemas"]["UserProfileDetailsResponse"];
}) {
    return (
        <Link href={`./user/${user.userId}`}>
            <Card className="gap-0 py-4 hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center gap-1 px-4">
                    <Avatar name={user.username} size={24} />
                    <h3 className="text-xl font-semibold leading-none truncate">
                        {user.displayName}
                    </h3>
                    {user.banned ? (
                        <Badge className="self-center" variant="destructive">
                            Banned
                        </Badge>
                    ) : null}
                    {user.role !== "user" ? (
                        <Badge
                            className="self-center py-0 px-1.5"
                            variant={ROLE_VARIANT_MAP[user.role]}
                        >
                            {capitalize(user.role)}
                        </Badge>
                    ) : null}
                </CardHeader>
                <CardContent className="px-4">
                    <p className="text-sm text-muted-foreground">
                        {user.totalBookmarks} bookmarks, {user.totalComments}{" "}
                        comments
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
