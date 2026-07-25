import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function PasskeySection() {
    const [isPending, setIsPending] = useState(false);

    const {
        data: passkeysData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["passkeys"],
        queryFn: async () => {
            const { data, error } = await authClient.passkey.listUserPasskeys();
            if (error) throw error;
            return data ?? [];
        },
        retry: false,
    });

    const handleAddPasskey = async () => {
        setIsPending(true);
        try {
            await authClient.passkey.addPasskey({
                name: `Passkey ${new Date().toLocaleDateString()}`,
            });
        } catch {
            // user cancelled or WebAuthn failed
        } finally {
            setIsPending(false);
            void refetch();
        }
    };

    const handleDeletePasskey = async (id: string) => {
        try {
            await authClient.passkey.deletePasskey({ id });
            void refetch();
        } catch {
            // deletion failed
        }
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold">Passkeys</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your passkeys for passwordless sign-in
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPasskey}
                    disabled={isPending}
                >
                    <Plus className="size-4" />
                    {isPending ? "Adding..." : "Add Passkey"}
                </Button>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
            ) : passkeysData && passkeysData.length > 0 ? (
                <div className="space-y-2">
                    {passkeysData.map((passkey) => (
                        <div
                            key={passkey.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="flex items-center gap-3">
                                <KeyRound className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {passkey.name || "Unnamed passkey"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Created{" "}
                                        {passkey.createdAt
                                            ? new Date(
                                                  passkey.createdAt,
                                              ).toLocaleDateString()
                                            : "Unknown"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePasskey(passkey.id)}
                            >
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No passkeys configured yet. Add one for faster, more secure
                    sign-in.
                </p>
            )}
        </Card>
    );
}
