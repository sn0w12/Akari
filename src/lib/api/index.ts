import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment, inPreview } from "@/config";
import pkg from "../../../package.json";
import { createBrowserClient } from "@supabase/ssr";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5188/";
const baseUrl = inDevelopment ? "http://localhost:5188/" : apiUrl;

const authenticatedFetch = async (
    url: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
    );
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
        ...((init?.headers as Record<string, string>) ?? {}),
    };
    if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    return fetch(url, { ...init, headers });
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
