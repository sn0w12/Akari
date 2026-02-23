import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/user/me");

            if (error) {
                throw new Error(error.data.message || "Failed to fetch user");
            }

            return data.data;
        },
        retry: false,
        staleTime: 60 * 60 * 1000, // 1 hour
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });
}
