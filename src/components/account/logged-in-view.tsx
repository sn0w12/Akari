"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonConfirmDialog } from "../ui/confirm";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    SecondaryAccount,
    SmallSecondaryAccount,
    validateSecondaryAccounts,
} from "@/lib/auth/secondary-accounts";
import { ListsTabContent } from "./lists";
import Link from "next/link";
import { ButtonLink } from "../ui/button-link";
import { Link as LinkIcon } from "lucide-react";
import { SECONDARY_ACCOUNTS } from "@/lib/auth/secondary-accounts";

interface LoggedInViewProps {
    savedUsername: string;
    handleLogout: () => void;
}

export default function LoggedInView({
    savedUsername,
    handleLogout,
}: LoggedInViewProps) {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>("account");
    const [validAccounts, setValidAccounts] = useState<SmallSecondaryAccount[]>(
        []
    );

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (
            tabParam &&
            ["account", "connections", "history"].includes(tabParam)
        ) {
            queueMicrotask(() => {
                setActiveTab(tabParam);
            });
        }
    }, [searchParams]);

    useEffect(() => {
        async function validate() {
            const results = await validateSecondaryAccounts();
            console.log(results);
            setValidAccounts(results);
        }
        validate();
    }, []);

    const handleSecondaryLogout = async (account: SecondaryAccount) => {
        const success = await account.logOut();
        if (success) {
            setValidAccounts((accounts) =>
                accounts.map((acc) =>
                    acc.id === account.id ? { ...acc, valid: false } : acc
                )
            );
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-2"
        >
            <TabsList>
                <TabsTrigger index={0} value="account">
                    Primary Account
                </TabsTrigger>
                <TabsTrigger index={1} value="connections">
                    Connected Services
                </TabsTrigger>
                <TabsTrigger index={2} value="lists">
                    Manga Lists
                </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Manage your primary Akari account settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">
                                    Username
                                </span>
                                <span className="text-xl font-bold">
                                    {savedUsername}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">
                                    Account Type
                                </span>
                                <span className="text-md">Akari</span>
                            </div>

                            <div className="pt-4 border-t mt-6">
                                <ButtonConfirmDialog
                                    triggerButton={
                                        <Button variant="destructive">
                                            Logout from all accounts
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
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="connections" className="space-y-6">
                {SECONDARY_ACCOUNTS.map((account) => {
                    const validAccount = validAccounts.find(
                        (validAccount) => validAccount.id === account.id
                    );
                    const isValid = validAccount?.valid;
                    return (
                        <Card key={account.id} className="gap-2">
                            <CardHeader>
                                <CardTitle>{account.name}</CardTitle>
                                <CardDescription>
                                    {isValid
                                        ? `Connected to your ${account.name} account`
                                        : `Connect your ${account.name} account to sync your manga list`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.getAuthUrl && !isValid && (
                                    <div className="space-y-4">
                                        <Link href={account.getAuthUrl()}>
                                            <Button
                                                className={`flex items-center gap-2 ${account.buttonColor} ${account.hoverColor}`}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                                Connect {account.name}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                {isValid && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-2">
                                            <p className="text-accent-color flex items-center gap-1">
                                                <span
                                                    className={`inline-block w-2 h-2 rounded-full ${account.buttonColor}`}
                                                />
                                                Connected
                                            </p>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <ButtonLink
                                                href={`/sync/${account.id}`}
                                                variant="outline"
                                            >
                                                Import Manga
                                            </ButtonLink>
                                            <ButtonConfirmDialog
                                                triggerButton={
                                                    <Button variant="destructive">
                                                        Disconnect
                                                    </Button>
                                                }
                                                title="Disconnect Account"
                                                description={`Are you sure you want to disconnect your ${account.name} account? This will stop syncing your manga data.`}
                                                confirmText="Disconnect"
                                                cancelText="Cancel"
                                                variant="destructive"
                                                onConfirm={() =>
                                                    handleSecondaryLogout(
                                                        account
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
                <ListsTabContent />
            </TabsContent>
        </Tabs>
    );
}
