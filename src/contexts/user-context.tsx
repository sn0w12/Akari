"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { createClient } from "@/lib/auth/client";

interface UserContextType {
    user: components["schemas"]["UserResponse"] | undefined;
    setUser: React.Dispatch<
        React.SetStateAction<components["schemas"]["UserResponse"] | undefined>
    >;
    isLoading: boolean;
    error: string | null;
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
            const supabase = createClient();
            const { data, error: authError } = await supabase.auth.getUser();

            if (authError) {
                throw new Error(authError.message || "Failed to fetch user");
            }

            if (data.user) {
                const userResponse: components["schemas"]["UserResponse"] = {
                    userId: data.user.id,
                    username:
                        data.user.user_metadata?.username ||
                        data.user.email ||
                        "",
                    displayName:
                        data.user.user_metadata?.displayName ||
                        data.user.user_metadata?.username ||
                        data.user.email ||
                        "",
                };
                setUser(userResponse);
            } else {
                setUser(undefined);
            }
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

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, error }}>
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
