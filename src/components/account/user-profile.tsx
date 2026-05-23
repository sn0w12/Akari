import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/contexts/confirm-context";
import { logOut } from "@/lib/auth/akari";
import { SECONDARY_ACCOUNTS } from "@/lib/auth/secondary-accounts";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export function UserProfile({
    user,
}: {
    user: components["schemas"]["UserResponse"];
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { confirm } = useConfirm();

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: "Confirm Logout",
            description:
                "Are you sure you want to logout from all accounts? This will also disconnect all linked services.",
            confirmText: "Logout",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!confirmed) return;

        await logOut(SECONDARY_ACCOUNTS);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        router.navigate({ to: "/" });
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar name={user.username} size={64} />

                    <div>
                        <Link to="/user/$userId" params={{ userId: user.userId }}>
                            <h2 className="text-xl font-semibold text-foreground hover:underline">
                                {user.displayName}
                            </h2>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            @{user.username}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground/70">
                            {user.userId}
                        </p>
                    </div>
                </div>

                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                </Button>
            </div>
        </Card>
    );
}
