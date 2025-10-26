"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { client } from "@/lib/api";

interface UserContextType {
    user: components["schemas"]["UserResponse"] | undefined;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<
        components["schemas"]["UserResponse"] | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data, error: apiError } = await client.GET("/v2/user/me");

            if (apiError) {
                throw new Error(
                    apiError.data?.message || "Failed to fetch user"
                );
            }

            setUser(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setUser(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refetch = fetchUser;

    return (
        <UserContext.Provider value={{ user, isLoading, error, refetch }}>
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
