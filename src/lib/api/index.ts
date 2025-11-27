import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment, inPreview } from "@/config";
import pkg from "../../../package.json";
import { createBrowserClient } from "@supabase/ssr";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5188/";
const baseUrl = inDevelopment ? "http://localhost:5188/" : apiUrl;

const authenticatedFetch = async (input: Request): Promise<Response> => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
    );
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const request = input.clone();
    if (session?.access_token) {
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
