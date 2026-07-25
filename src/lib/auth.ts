import { env } from "@/lib/env";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Pool } from "pg";

const pool = new Pool({
    host: env("DATABASE_HOST") || "localhost",
    port: parseInt(env("DATABASE_PORT") || "5432", 10),
    user: env("DATABASE_USER") || "postgres",
    password: env("DATABASE_PASSWORD") || "password",
    database: env("DATABASE_NAME") || "postgres",
    options: "-c search_path=auth",
});

function toFullUrl(host: string) {
    if (host.startsWith("http")) return host;

    if (host.includes("localhost") || host.includes("127.0.0.1")) {
        return `http://${host}`;
    }
    return `https://${host}`;
}

function toHost(url: string | undefined) {
    if (!url) return undefined;
    return url
        .replace("http://", "")
        .replace("https://", "")
        .replace(/^\/|\/+$/g, "");
}

export const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        enabled: true,
    },
    plugins: [username(), passkey(), tanstackStartCookies()],
    baseURL: toFullUrl(env("VITE_HOST") ?? "localhost:3000"),
    allowedHosts: [toHost(env("VITE_HOST")), toHost(env("VITE_API_URL"))],
    user: {
        additionalFields: {
            role: {
                type: ["user", "admin", "owner"],
                required: false,
                defaultValue: "user",
                input: false,
            },
            banned: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
        },
    },
});

export async function getAuthToken() {
    try {
        const headers = new Headers(getRequestHeaders());
        const session = await auth.api.getSession({ headers });
        return session?.session?.token;
    } catch {
        return undefined;
    }
}
