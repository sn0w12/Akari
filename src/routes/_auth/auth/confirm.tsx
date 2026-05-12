import { createFileRoute, redirect } from "@tanstack/react-router";
import { createClient } from "@/lib/auth/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export const Route = createFileRoute("/_auth/auth/confirm")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { searchParams } = new URL(request.url);
                const token_hash = searchParams.get("token_hash");
                const type = searchParams.get("type") as EmailOtpType | null;
                const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";

                if (token_hash && type) {
                    const supabase = await createClient();
                    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
                    if (!error) {
                        throw redirect({ to: next });
                    } else {
                        throw redirect({ to: "/auth/error", search: { error: error?.message || "" } });
                    }
                }
                throw redirect({ to: "/auth/error", search: { error: "No token hash or type" } });
            },
        },
    },
});
