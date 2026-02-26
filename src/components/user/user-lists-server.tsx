import { client, serverHeaders } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import { cacheLife, cacheTag } from "next/cache";
import ErrorPage from "../error-page";
import { UserLists } from "./user-lists";

async function getUserData(userId: string, token: string | undefined) {
    "use cache";
    cacheLife("hours");
    cacheTag("user-lists", `user-${userId}-lists`);

    const { data, error } = await client.GET("/v2/lists/user/{userId}", {
        params: {
            path: {
                userId: userId,
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

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

export async function UserListsServer({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const token = await getAuthToken();
    const { data, error } = await getUserData(id, token);

    if (error || !data) {
        return <ErrorPage error={error} />;
    }

    return <UserLists userId={id} initialData={data} />;
}
