import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const _next = searchParams.get("next");
    const next = _next?.startsWith("/") ? _next : "/";

    if (code) {
        const supabase = await createClient();
        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            // redirect the user to an error page with some instructions
            redirect(`/auth/error?error=${error?.message}`);
        }

        const user = data.user;
        const isRecentCreation =
            new Date(user.created_at).getTime() > Date.now() - 60000;
        const hasSingleIdentity = user.identities?.length === 1;
        const isFirstWithProvider = isRecentCreation && hasSingleIdentity;

        if (isFirstWithProvider) {
            // redirect new users to the account setup page
            redirect("/account/setup");
        }

        redirect(next);
    }

    // return the user to an error page with instructions
    redirect(`/auth/error?error=No code provided`);
}
