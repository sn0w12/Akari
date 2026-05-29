import { Card } from "@/components/ui/card";
import {
    getSecondaryAccountById,
    SecondaryAccountId,
} from "@/lib/auth/secondary-accounts";
import { StorageManager } from "@/lib/storage";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useReducer } from "react";
import ErrorComponent from "./error-page";

type CallbackState = {
    error: components["schemas"]["ErrorResponse"] | undefined;
    success: boolean;
};

type CallbackAction =
    | { type: "ERROR"; error: components["schemas"]["ErrorResponse"] }
    | { type: "SUCCESS" };

function callbackReducer(
    _state: CallbackState,
    action: CallbackAction,
): CallbackState {
    switch (action.type) {
        case "ERROR":
            return { error: action.error, success: false };
        case "SUCCESS":
            return { error: undefined, success: true };
    }
}

const CallbackPage = () => {
    const router = useRouter();
    const [{ error, success }, dispatch] = useReducer(callbackReducer, {
        error: undefined,
        success: false,
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(
            router.state.location.searchStr,
        );
        const provider = searchParams.get("provider") || "mal";
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const getToken = async (accountId: string) => {
            const account = getSecondaryAccountById(
                accountId as SecondaryAccountId,
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
                    provider as SecondaryAccountId,
                );
                if (!account) {
                    dispatch({
                        type: "ERROR",
                        error: {
                            result: "Error",
                            status: 500,
                            data: {
                                message: "Unknown provider",
                            },
                        },
                    });
                    return;
                }
                const tokenSuccess = await getToken(account.id);

                if (!tokenSuccess) {
                    dispatch({
                        type: "ERROR",
                        error: {
                            result: "Error",
                            status: 500,
                            data: {
                                message: "Failed to handle callback",
                            },
                        },
                    });
                    return;
                }

                const validateSuccess = await account.validate();
                if (!validateSuccess) {
                    dispatch({
                        type: "ERROR",
                        error: {
                            result: "Error",
                            status: 500,
                            data: {
                                message: "Failed to validate account",
                            },
                        },
                    });
                    return;
                }

                dispatch({ type: "SUCCESS" });
                const cacheStorage = StorageManager.get(
                    "secondaryAccountCache",
                    { accountId: provider },
                );
                cacheStorage.set({ valid: true });
                void router.navigate({ to: "/account" });
            } catch (err) {
                dispatch({
                    type: "ERROR",
                    error: {
                        result: "Error",
                        status: 500,
                        data: {
                            message:
                                err instanceof Error
                                    ? err.message
                                    : "Unknown error",
                        },
                    },
                });
            } finally {
                timeoutId = setTimeout(() => {
                    void router.navigate({ to: "/account" });
                }, 5000);
            }
        };

        void processCallback();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [router]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
            {error ? (
                <ErrorComponent error={error} />
            ) : (
                <Card className="p-6 space-y-4 text-center">
                    <p
                        className={`${success ? "text-green-500" : "text-muted-foreground"}`}
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
