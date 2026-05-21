import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";
import { ResponseCacheControlBuilder } from "@/lib/cache";

export const Route = createFileRoute("/_default/auth/login/")({
    component: LoginPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder().noCache().build(),
    }),
});

function LoginPage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}
