import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment, inPreview } from "@/config";
import pkg from "../../../package.json";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5188/";
const baseUrl = inDevelopment ? "http://localhost:5188/" : apiUrl;

export function getAuthCookie() {
    if (typeof document === "undefined") {
        return null;
    }

    const authCookies = document.cookie
        .split("; ")
        .filter((row) => row.startsWith("sb-db-auth-token"));
    if (authCookies.length === 0) {
        return null;
    }

    try {
        const singleCookie = authCookies.find((row) => !row.includes("."));
        if (singleCookie) {
            // Old format: single cookie
            const value = singleCookie.split("=")[1];
            return JSON.parse(atob(value.replace("base64-", "")));
        } else {
            // New format: multi-part cookies
            const parts = authCookies
                .map((row) => {
                    const [key, value] = row.split("=");
                    const match = key.match(/^sb-db-auth-token\.(\d+)$/);
                    if (!match) return null;
                    return { num: parseInt(match[1]), value };
                })
                .filter((item): item is { num: number; value: string } => item !== null)
                .sort((a, b) => a.num - b.num)
                .map((p) => p.value);
            if (parts.length === 0) return null;
            const fullValue = parts.join("");
            const base64 = fullValue.startsWith("base64-")
                ? fullValue.replace("base64-", "")
                : fullValue;
            return JSON.parse(atob(base64));
        }
    } catch (error) {
        console.error("Failed to parse auth cookie:", error);
        return null;
    }
}

const authenticatedFetch = async (input: Request): Promise<Response> => {
    const request = input.clone();
    const session = getAuthCookie();

    if (
        session?.access_token &&
        request.headers.get("Authorization") === null
    ) {
        request.headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(request);
};

export const client = createClient<paths>({
    baseUrl,
    credentials: "include",
    fetch: authenticatedFetch,
});

export const serverHeaders = {
    "X-API-Key": process.env.API_KEY || "",
    "user-agent": `AkariWebsite/${pkg.version}/${
        inPreview ? "preview" : "production"
    }`,
};
