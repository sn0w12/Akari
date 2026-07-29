import { env } from "@/lib/env";
import type { paths } from "@/types/api";
import createClient from "openapi-fetch";
import { authClient } from "@/lib/auth/client";

const apiUrl =
    env("API_URL") || env("VITE_API_URL") || "http://localhost:5188/";
const serverHeaders = {
    "X-API-Key": env("API_KEY") || "",
} as const;

export async function getAuthSession() {
    if (typeof document === "undefined") {
        return null;
    }

    const { data, error } = await authClient.getSession();

    if (error) {
        console.error("Failed to restore auth session:", error);
        return null;
    }

    return data?.session ?? null;
}

const authenticatedFetch = async (input: Request): Promise<Response> => {
    const request = input.clone();
    const session = await getAuthSession();

    if (session?.token && request.headers.get("Authorization") === null) {
        request.headers.set("Authorization", `Bearer ${session.token}`);
    }
    Object.keys(serverHeaders).forEach((key) => {
        request.headers.set(
            key,
            serverHeaders[key as keyof typeof serverHeaders],
        );
    });

    return fetch(request);
};

export const client = createClient<paths>({
    baseUrl: apiUrl,
    credentials: "include",
    fetch: authenticatedFetch,
});
