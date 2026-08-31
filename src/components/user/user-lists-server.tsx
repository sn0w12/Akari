import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ErrorPage from "../error-page";
import { UserLists } from "./user-lists";

function getUserData(userId: string) {
    return client.GET("/v2/lists/user/{userId}", {
        params: {
            path: {
                userId: userId,
            },
            query: {
                page: 1,
                pageSize: 12,
            },
        },
    });
}

export function UserListsServer({ id }: { id: string }) {
    const { data, error } = useQuery({
        queryKey: ["user-lists", id],
        queryFn: async () => {
            const { data, error } = await getUserData(id);
            if (error) throw error;
            return data;
        },
    });

    if (error) return <ErrorPage error={error as never} />;
    if (!data) return null;

    return <UserLists userId={id} initialData={data} />;
}
