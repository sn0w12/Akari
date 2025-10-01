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
import { SecondaryAccount } from "@/lib/auth/secondary-accounts";
import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";

interface LoggedInViewProps {
    secondaryAccounts: SecondaryAccount[];
    setSecondaryAccounts: React.Dispatch<
        React.SetStateAction<SecondaryAccount[]>
    >;
    savedUsername: string;
    handleLogout: () => void;
    handleSecondaryLogout: (account: SecondaryAccount) => void;
}

export default function LoggedInView({
    secondaryAccounts,
    savedUsername,
    handleLogout,
    handleSecondaryLogout,
}: LoggedInViewProps) {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>("account");

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (
            tabParam &&
            ["account", "connections", "history"].includes(tabParam)
        ) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

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
            </TabsList>

            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Manage your primary Manganato account settings
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
                                <span className="text-md">Manganato</span>
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
                {secondaryAccounts.map((account) => (
                    <Card key={account.id}>
                        <CardHeader>
                            <CardTitle>{account.name}</CardTitle>
                            <CardDescription>
                                {account.user
                                    ? `Connected to your ${account.name} account`
                                    : `Connect your ${account.name} account to sync your manga list`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {account.authUrl && !account.user && (
                                <div className="space-y-4">
                                    <Link href={account.authUrl}>
                                        <Button
                                            className={`flex items-center gap-2 ${account.buttonColor} ${account.hoverColor}`}
                                        >
                                            <LinkIcon className="h-4 w-4" />
                                            Connect {account.name}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            {account.user && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">
                                                Username
                                            </span>
                                            <span className="text-xl font-bold">
                                                {account.user.name}
                                            </span>
                                        </div>
                                        <p className="text-accent-color flex items-center gap-1">
                                            <span
                                                className={`inline-block w-2 h-2 rounded-full ${account.buttonColor}`}
                                            ></span>
                                            Connected
                                        </p>
                                    </div>
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
                                            handleSecondaryLogout(account)
                                        }
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </TabsContent>
        </Tabs>
    );
}
