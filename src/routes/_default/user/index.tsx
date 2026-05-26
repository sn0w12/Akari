import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import ErrorPage from "@/components/error-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROLE_VARIANT_MAP } from "@/components/user/users-header";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { client, serverHeaders } from "@/lib/api";
import { capitalize } from "@/lib/utils";

const getUsers = createServerFn({ method: "GET" })
  .inputValidator(() => undefined)
  .handler(async () => {
    const { data, error } = await client.GET("/v2/user", {
      params: {
        query: { page: 1, pageSize: 100, sortBy: "TotalBookmarks" },
      },
      headers: serverHeaders,
    });
    return { data: data?.data ?? null, error };
  });

export const Route = createFileRoute("/_default/user/")({
  loader: () => getUsers(),
  component: UsersPage,
  headers: () => ({
    "Cache-Control": new ResponseCacheControlBuilder()
      .maxAge({ minutes: 10 })
      .staleWhileRevalidate({ minutes: 30 })
      .public()
      .build(),
  }),
});

function UsersPage() {
  const { data, error } = Route.useLoaderData();

  if (error) return <ErrorPage error={error} />;

  return (
    <div className="flex-1 px-4 pt-2 pb-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-semibold mb-2">Users</h2>
      </div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.items.map((user) => (
          <Link key={user.userId} to="/user/$userId" params={{ userId: user.userId }}>
            <Card className="gap-0 py-4 hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center gap-1 px-4">
                <Avatar name={user.username} size={24} />
                <h3 className="text-xl font-semibold leading-none truncate">{user.displayName}</h3>
                {user.banned ? (
                  <Badge className="self-center" variant="destructive">
                    Banned
                  </Badge>
                ) : null}
                {user.role !== "user" ? (
                  <Badge className="self-center py-0 px-1.5" variant={ROLE_VARIANT_MAP[user.role]}>
                    {capitalize(user.role)}
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-sm text-muted-foreground">
                  {user.totalBookmarks} bookmarks, {user.totalComments} comments
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
