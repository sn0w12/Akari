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
    setUser: React.Dispatch<
        React.SetStateAction<components["schemas"]["UserResponse"] | undefined>
    >;
    error: string | null;
    refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<
        components["schemas"]["UserResponse"] | undefined
    >(undefined);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            setError(null);
            const { data, error } = await client.GET("/v2/user/me");

            if (error || !data) {
                setUser(undefined);
            }

            if (data && data.data) {
                setUser(data.data);
            } else {
                setUser(undefined);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setUser(undefined);
        }
    };

    const refreshUser = () => {
        fetchUser();
    };

    useEffect(() => {
        queueMicrotask(() => {
            fetchUser();
        });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, error, refreshUser }}>
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
