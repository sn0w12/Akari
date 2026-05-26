import { inPreview } from "@/config";
import { createClient as createAuthClient } from "@/lib/auth/client";
import { env } from "@/lib/env";
import type { paths } from "@/types/api";
import createClient from "openapi-fetch";
import pkg from "../../../package.json";

const apiUrl =
    env("API_URL") ||
    env("VITE_API_URL") ||
    "http://localhost:5188/";

export async function getAuthSession() {
    if (typeof document === "undefined") {
        return null;
    }

    const {
        data: { session },
        error,
    } = await createAuthClient().auth.getSession();

    if (error) {
        console.error("Failed to restore auth session:", error);
        return null;
    }

    return session;
}

const authenticatedFetch = async (input: Request): Promise<Response> => {
    const request = input.clone();
    const session = await getAuthSession();

    if (
        session?.access_token &&
        request.headers.get("Authorization") === null
    ) {
        request.headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(request);
};

export const client = createClient<paths>({
    baseUrl: apiUrl,
    credentials: "include",
    fetch: authenticatedFetch,
});

export const serverHeaders = {
    "X-API-Key": env("API_KEY") || "",
    "user-agent": `AkariWebsite/${pkg.version}/${
        inPreview ? "preview" : "production"
    }`,
};
