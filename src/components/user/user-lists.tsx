"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { ListItem } from "../account/list-item";
import { Skeleton } from "../ui/skeleton";
import ClientPagination from "../ui/pagination/client-pagination";

interface UserListsProps {
    userId: string;
}

export function UserLists({ userId }: UserListsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isLoading } = useQuery({
        queryKey: ["user-lists"],
        refetchOnMount: false,
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/lists/user/{userId}",
                {
                    params: {
                        path: {
                            userId: userId,
                        },
                        query: {
                            page: currentPage,
                            pageSize: 12,
                        },
                    },
                }
            );
            if (error) {
                throw new Error("Failed to fetch user lists");
            }

            return data;
        },
    });

    if (isLoading || !data) {
        return (
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {data.data.items.map((item) => (
                    <ListItem key={item.id} list={item} />
                ))}
            </div>
            {data.data.totalPages > 1 && (
                <ClientPagination
                    currentPage={currentPage}
                    totalPages={data.data.totalPages}
                    handlePageChange={(page) => setCurrentPage(page)}
                    className="mt-4"
                />
            )}
        </div>
    );
}
