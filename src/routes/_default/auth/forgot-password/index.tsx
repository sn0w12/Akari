import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const Route = createFileRoute("/_default/auth/forgot-password/")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
