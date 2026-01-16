import { client } from "@/lib/api";
import { Skeleton } from "../ui/skeleton";
import { UserLists } from "./user-lists";

export async function UserListsSkeleton() {
    return (
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
        </div>
    );
}

export async function UserListsServer({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const { data, error } = await client.GET("/v2/lists/user/{userId}", {
        params: {
            path: {
                userId: id,
            },
            query: {
                page: 1,
                pageSize: 12,
            },
        },
    });

    if (error || !data) {
        throw new Error("Failed to fetch user lists");
    }

    return <UserLists userId={id} initialData={data} />;
}
