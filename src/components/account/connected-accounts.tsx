"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "../ui/button-link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, LogIn, LogOut } from "lucide-react";
import {
    SECONDARY_ACCOUNTS,
    SecondaryAccount,
    SmallSecondaryAccount,
    validateSecondaryAccounts,
} from "@/lib/auth/secondary-accounts";
import { ButtonConfirmDialog } from "../ui/confirm";

export function ConnectedAccounts() {
    const [validAccounts, setValidAccounts] = useState<SmallSecondaryAccount[]>(
        []
    );

    useEffect(() => {
        async function validate() {
            const results = await validateSecondaryAccounts();
            setValidAccounts(results);
        }
        validate();
    }, []);

    const handleLogout = async (account: SecondaryAccount) => {
        const success = await account.logOut();
        if (success) {
            setValidAccounts((accounts) =>
                accounts.map((acc) =>
                    acc.id === account.id ? { ...acc, valid: false } : acc
                )
            );
        }
    };

    return (
        <Card className="p-4 gap-2">
            <div>
                <h2 className="text-xl font-semibold text-foreground">
                    Connected Accounts
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Link external accounts to import and sync your manga
                    collection
                </p>
            </div>

            <div className="space-y-4">
                {SECONDARY_ACCOUNTS.map((account) => {
                    const validAccount = validAccounts.find(
                        (validAccount) => validAccount.id === account.id
                    );
                    const isValid = validAccount?.valid;

                    return (
                        <div
                            key={account.id}
                            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${account.buttonColor} text-white`}
                                >
                                    <span className="font-semibold">
                                        {account.displayName}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-foreground">
                                            {account.name}
                                        </h3>
                                        {isValid && <Badge>Connected</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {isValid
                                            ? "Account successfully linked"
                                            : "Not connected"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {isValid ? (
                                    <>
                                        <ButtonLink
                                            href={`/sync/${account.id}`}
                                            variant="default"
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Import Manga
                                        </ButtonLink>
                                        <ButtonConfirmDialog
                                            triggerButton={
                                                <Button variant="destructive">
                                                    <LogOut className="h-4 w-4" />
                                                    Disconnect
                                                </Button>
                                            }
                                            title="Disconnect Account"
                                            description={`Are you sure you want to disconnect your ${account.name} account? This will stop syncing your manga data.`}
                                            confirmText="Disconnect"
                                            cancelText="Cancel"
                                            variant="destructive"
                                            onConfirm={() =>
                                                handleLogout(account)
                                            }
                                        />
                                    </>
                                ) : (
                                    <ButtonLink
                                        href={account.getAuthUrl()}
                                        size="sm"
                                        className={`gap-2 ${account.buttonColor} ${account.hoverColor} text-white`}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Connect {account.displayName}
                                    </ButtonLink>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
