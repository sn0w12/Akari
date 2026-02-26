"use client";

import { client } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ListItem } from "../account/list-item";
import ClientPagination from "../ui/pagination/client-pagination";
import { UserListsSkeleton } from "./user-lists-skeleton";

type UserListsResponse =
    components["schemas"]["UserMangaListPaginatedResponseSuccessResponse"];

interface UserListsProps {
    userId: string;
    initialData: UserListsResponse;
}

export function UserLists({ userId, initialData }: UserListsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["user-lists", userId, currentPage],
        initialData: currentPage === 1 ? initialData : undefined,
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
                },
            );
            if (error) {
                throw new Error("Failed to fetch user lists");
            }

            return data;
        },
    });

    const handleDelete = () => {
        queryClient.invalidateQueries({ queryKey: ["user-lists", userId] });
    };

    if (isLoading || !data) {
        return <UserListsSkeleton />;
    }

    return (
        <div className="flex flex-col justify-between flex-1">
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {data.data.items.map((item) => (
                    <ListItem
                        key={item.id}
                        list={item}
                        onDelete={handleDelete}
                    />
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
