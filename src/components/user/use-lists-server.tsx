import { client, serverHeaders } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import { Skeleton } from "../ui/skeleton";
import { UserLists } from "./user-lists";



export async function UserListsServer({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const token = await getAuthToken();

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
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            ...serverHeaders,
        },
    });

    if (error || !data) {
        throw new Error("Failed to fetch user lists");
    }

    return <UserLists userId={id} initialData={data} />;
}
