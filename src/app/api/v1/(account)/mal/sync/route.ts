import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { supabaseAdmin } from "@/lib/api/supabase";
import { hashUsername } from "@/lib/auth/user";
import { SyncStatus } from "@/types/api";

const ENCRYPTION_KEY = process.env.SUPABASE_ENCRYPTION_KEY!;
if (!ENCRYPTION_KEY) throw new Error("SUPABASE_ENCRYPTION_KEY is required");

export async function GET() {
    const cookieStore = await cookies();
    const username = getUsernameFromCookies(cookieStore);
    if (!username) {
        return createApiErrorResponse(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!supabaseAdmin) {
        return createApiErrorResponse(
            { message: "Database unavailable" },
            { status: 500 }
        );
    }

    try {
        const userIdentifier = await hashUsername(
            username,
            process.env.USER_HASH_SECRET!
        );
        const { data, error } = await supabaseAdmin
            .from("sync_queue")
            .select("status, requested_at, error_message")
            .eq("user_identifier", userIdentifier)
            .order("requested_at", { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") throw error;

        let position: number | null = null;
        if (data?.status === "pending") {
            const { count } = await supabaseAdmin
                .from("sync_queue")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending")
                .lt("requested_at", data.requested_at);
            position = (count || 0) + 1;
        }

        const status: SyncStatus = {
            status: data?.status || null,
            position,
            requestedAt: data?.requested_at || null,
            errorMessage: data?.error_message || null,
        };

        return createApiResponse(status);
    } catch (error) {
        return createApiErrorResponse(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

export async function POST() {
    const cookieStore = await cookies();
    const username = getUsernameFromCookies(cookieStore);
    if (!username) {
        return createApiErrorResponse(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!supabaseAdmin) {
        return createApiErrorResponse(
            { message: "Database unavailable" },
            { status: 500 }
        );
    }

    try {
        const userIdentifier = await hashUsername(
            username,
            process.env.USER_HASH_SECRET!
        );

        // Check for existing pending or processing request
        const { data: existing } = await supabaseAdmin
            .from("sync_queue")
            .select("status")
            .eq("user_identifier", userIdentifier)
            .in("status", ["pending", "processing"])
            .single();

        if (existing) {
            return createApiErrorResponse(
                { message: "Sync already requested or in progress" },
                { status: 409 }
            );
        }

        // Get tokens from cookies
        const accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;
        if (!accessToken || !refreshToken) {
            return createApiErrorResponse(
                { message: "Missing authentication tokens" },
                { status: 401 }
            );
        }

        await supabaseAdmin.rpc("upsert_user_tokens", {
            p_user_identifier: userIdentifier,
            p_plain_access: accessToken,
            p_plain_refresh: refreshToken,
            p_encryption_key: ENCRYPTION_KEY,
        });

        // Add to queue
        const { data: inserted, error } = await supabaseAdmin
            .from("sync_queue")
            .insert({ user_identifier: userIdentifier, status: "pending" })
            .select("status, requested_at")
            .single();

        if (error) throw error;

        // Calculate position for the newly inserted item
        const { count } = await supabaseAdmin
            .from("sync_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")
            .lt("requested_at", inserted.requested_at);
        const position = (count || 0) + 1;

        const status: SyncStatus = {
            status: inserted.status,
            position,
            requestedAt: inserted.requested_at,
            errorMessage: null,
        };

        return createApiResponse(status);
    } catch (error) {
        return createApiErrorResponse(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
