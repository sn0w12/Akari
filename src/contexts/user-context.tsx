"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";

interface UserContextType {
    user: components["schemas"]["UserResponse"] | undefined;
    error: string | null;
    isLoading: boolean;
    refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const {
        data: user,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/user/me");

            if (error) {
                throw new Error(error.data.message || "Failed to fetch user");
            }

            return data.data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    const refreshUser = () => {
        refetch();
    };

    return (
        <UserContext.Provider
            value={{
                user,
                error: error?.message || null,
                isLoading,
                refreshUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
