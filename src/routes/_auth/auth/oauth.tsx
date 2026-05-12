import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@/lib/auth/server";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/auth/oauth")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const { searchParams } = new URL(request.url);
                const code = searchParams.get("code");
                const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/";

                if (code) {
                    const supabase = await createClient();
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        throw redirect({ to: "/auth/error", search: { error: error?.message || "" } });
                    }
                    const user = data.user;
                    const isRecentCreation = new Date(user.created_at).getTime() > Date.now() - 60000;
                    const hasSingleIdentity = user.identities?.length === 1;
                    if (isRecentCreation && hasSingleIdentity) {
                        throw redirect({ to: "/account/setup" });
                    }
                    throw redirect({ to: next });
                }
                throw redirect({ to: "/auth/error", search: { error: "No code provided" } });
            },
        },
    },
});
