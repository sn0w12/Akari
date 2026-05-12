import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/sign-up-form";

export const Route = createFileRoute("/_default/auth/sign-up/")({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignUpForm />
            </div>
        </div>
    );
}
