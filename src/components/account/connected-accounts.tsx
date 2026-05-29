import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardPanel,
    CardTitle,
} from "@/components/ui/card";
import {
    SECONDARY_ACCOUNTS,
    SecondaryAccount,
    SmallSecondaryAccount,
    validateSecondaryAccounts,
} from "@/lib/auth/secondary-accounts";
import { useConfirm } from "@/contexts/confirm-context";
import { cn } from "@/lib/utils";
import { Download, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "../ui/button-link";

export function ConnectedAccounts() {
    const [validAccounts, setValidAccounts] = useState<SmallSecondaryAccount[]>(
        [],
    );
    const { confirm } = useConfirm();

    useEffect(() => {
        async function validate() {
            const results = await validateSecondaryAccounts();
            setValidAccounts(results);
        }
        void validate();
    }, []);

    const handleLogout = async (account: SecondaryAccount) => {
        const confirmed = await confirm({
            title: "Disconnect Account",
            description: `Are you sure you want to disconnect your ${account.name} account? This will stop syncing your manga data.`,
            confirmText: "Disconnect",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!confirmed) return;

        const success = await account.logOut();
        if (success) {
            setValidAccounts((accounts) =>
                accounts.map((acc) =>
                    acc.id === account.id ? { ...acc, valid: false } : acc,
                ),
            );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                    Link external accounts to import and sync your manga
                    collection
                </CardDescription>
            </CardHeader>
            <CardPanel>
                <Card>
                    {SECONDARY_ACCOUNTS.map((account, index) => {
                        const validAccount = validAccounts.find(
                            (validAccount) => validAccount.id === account.id,
                        );
                        const isValid = validAccount?.valid;
                        const accountName =
                            account.userStorage.get()?.name ?? null;
                        const accountUrl = account.getAccountUrl();

                        const isFirst = index === 0;
                        const isLast = index === SECONDARY_ACCOUNTS.length - 1;

                        return (
                            <div
                                key={account.id}
                                className={cn(
                                    "flex border-t border-border flex-col p-4 gap-2 sm:flex-row sm:items-center sm:justify-between",
                                    {
                                        "rounded-t-lg": isFirst,
                                        "rounded-b-lg": isLast,
                                        "border-t-0": isFirst,
                                    },
                                )}
                                style={
                                    {
                                        "--color": account.color,
                                        "--text-color": account.textColor,
                                    } as React.CSSProperties
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex size-12 items-center justify-center rounded-lg bg-[var(--color)] text-[var(--text-color)]`}
                                    >
                                        <span className="font-semibold">
                                            {account.id.toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-foreground">
                                                {accountUrl ? (
                                                    <a
                                                        href={accountUrl}
                                                        target="_blank"
                                                        className="hover:underline"
                                                    >
                                                        {account.name}
                                                    </a>
                                                ) : (
                                                    account.name
                                                )}
                                            </h3>
                                            {isValid && accountName && (
                                                <Badge className="w-fit">
                                                    {accountName}
                                                </Badge>
                                            )}
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
                                                to={
                                                    `/sync/${account.id}` as
                                                        | "/sync/ani"
                                                        | "/sync/mal"
                                                }
                                                variant="default"
                                                className="gap-2 flex-1 sm:flex-initial"
                                            >
                                                <Download className="size-4" />
                                                Import Manga
                                            </ButtonLink>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 sm:flex-initial"
                                                onClick={() =>
                                                    handleLogout(account)
                                                }
                                            >
                                                <LogOut className="size-4" />
                                                Disconnect
                                            </Button>
                                        </>
                                    ) : (
                                        <a
                                            href={account.getAuthUrl()}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2"
                                            style={{
                                                backgroundColor: "var(--color)",
                                                color: "var(--text-color)",
                                            }}
                                        >
                                            <LogIn className="size-4" />
                                            Connect {account.name}
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </Card>
            </CardPanel>
        </Card>
    );
}
