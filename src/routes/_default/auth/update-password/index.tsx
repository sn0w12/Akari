import { createFileRoute } from "@tanstack/react-router";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { ResponseCacheControlBuilder } from "@/lib/cache";

export const Route = createFileRoute("/_default/auth/update-password/")({
    validateSearch: (
        search: Record<string, string>,
    ): { token?: string; error?: string } => ({
        token: search.token || undefined,
        error: search.error || undefined,
    }),
    component: UpdatePasswordPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder().noCache().build(),
    }),
});

function UpdatePasswordPage() {
    const { token, error } = Route.useSearch();
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <UpdatePasswordForm token={token} error={error} />
            </div>
        </div>
    );
}
