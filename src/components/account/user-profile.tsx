"use client";

import { Button } from "@/components/ui/button";
import { ButtonConfirmDialog } from "../ui/confirm";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { logOut } from "@/lib/auth/akari";
import { SECONDARY_ACCOUNTS } from "@/lib/auth/secondary-accounts";
import { useRouter } from "next/navigation";

export function UserProfile({
    user,
}: {
    user: components["schemas"]["UserResponse"];
}) {
    const router = useRouter();

    const handleLogout = async () => {
        await logOut(SECONDARY_ACCOUNTS);
        router.push("/");
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar name={user.displayName} size={64} />

                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            {user.displayName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            @{user.username}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground/70">
                            {user.userId}
                        </p>
                    </div>
                </div>

                <ButtonConfirmDialog
                    triggerButton={
                        <Button variant="destructive">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    }
                    title="Confirm Logout"
                    description="Are you sure you want to logout from all accounts? This will also disconnect all linked services."
                    confirmText="Logout"
                    cancelText="Cancel"
                    variant="destructive"
                    onConfirm={handleLogout}
                />
            </div>
        </Card>
    );
}
