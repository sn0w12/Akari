import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <UpdatePasswordForm />
            </div>
        </div>
    );
}
