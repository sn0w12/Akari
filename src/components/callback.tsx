"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import ErrorComponent from "./error-page";
import {
    getSecondaryAccountById,
    SecondaryAccountId,
} from "@/lib/auth/secondary-accounts";
import { StorageManager } from "@/lib/storage";

const CallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<
        components["schemas"]["ErrorResponse"] | undefined
    >(undefined);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        const provider = searchParams.get("provider") || "mal";

        const getToken = async (accountId: string) => {
            const account = getSecondaryAccountById(
                accountId as SecondaryAccountId
            );
            if (!account) {
                throw new Error("Unknown provider");
            }

            const params = Object.fromEntries(searchParams.entries());
            const hash = window.location.hash.substring(1);
            return account.handleCallback(params, hash, window.location.origin);
        };

        const processCallback = async () => {
            try {
                const account = getSecondaryAccountById(
                    provider as SecondaryAccountId
                );
                if (!account) {
                    setError({
                        result: "Error",
                        status: 500,
                        data: {
                            message: "Unknown provider",
                        },
                    });
                    return;
                }
                const tokenSuccess = await getToken(account.id);

                if (!tokenSuccess) {
                    setError({
                        result: "Error",
                        status: 500,
                        data: {
                            message: "Failed to handle callback",
                        },
                    });
                    return;
                }

                const validateSuccess = await account.validate();
                if (!validateSuccess) {
                    setError({
                        result: "Error",
                        status: 500,
                        data: {
                            message: "Failed to validate account",
                        },
                    });
                    return;
                }

                setSuccess(true);
                const cacheStorage = StorageManager.get(
                    "secondaryAccountCache"
                );
                cacheStorage.set({ valid: true }, { accountId: provider });
                router.push("/account");
            } catch (error) {
                setError({
                    result: "Error",
                    status: 500,
                    data: {
                        message:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    },
                });
            } finally {
                setTimeout(() => {
                    router.push("/account");
                }, 5000);
            }
        };

        processCallback();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
            {error ? (
                <ErrorComponent error={error} />
            ) : (
                <Card className="p-6 space-y-4 text-center">
                    <p
                        className={`${
                            success ? "text-green-500" : "text-muted-foreground"
                        }`}
                    >
                        {success
                            ? "Success!"
                            : "Exchanging authorization code for access token..."}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default CallbackPage;
