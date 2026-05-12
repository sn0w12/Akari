import { createFileRoute } from "@tanstack/react-router";
import { SetupAccountForm } from "@/components/auth/setup";

export const Route = createFileRoute("/_default/account/setup/")({
    component: Setup,
});

function Setup() {
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SetupAccountForm />
            </div>
        </div>
    );
}
