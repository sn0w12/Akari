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

    const sbAuthTokenRow = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sb-db-auth-token"));
    if (!sbAuthTokenRow) {
        return null;
    }

    return JSON.parse(
        atob(sbAuthTokenRow.split("=")[1].replace("base64-", ""))
    );
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
