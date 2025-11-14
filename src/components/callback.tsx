"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { client } from "@/lib/api";
import Cookies from "js-cookie";
import ErrorComponent from "./error-page";
import { getSecondaryAccountById } from "@/lib/auth/secondary-accounts";

const CallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<
        components["schemas"]["ErrorResponse"] | undefined
    >(undefined);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        const code = searchParams.get("code");
        const codeVerifier = Cookies.get("pkce_code_verifier");

        if (!code || !codeVerifier) {
            setError({
                result: "Error",
                status: 500,
                data: {
                    message: "Missing code or code verifier",
                },
            });
            return;
        }

        // Send request to exchange code for tokens
        const fetchToken = async () => {
            const acc = getSecondaryAccountById("mal");
            if (!acc) return;

            try {
                const { error } = await client.POST("/v2/mal/token", {
                    body: {
                        code,
                        codeVerifier: codeVerifier,
                        redirectUri: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) {
                    setError(error);
                    return;
                }

                setSuccess(true);
                Cookies.remove("pkce_code_verifier");

                const { error: userError } = await client.GET(
                    "/v2/mal/mangalist"
                );

                if (userError) {
                    setError(userError);
                    return;
                }

                sessionStorage.setItem(acc.sessionKey, "true");

                router.push("/");
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
                setTimeout(() => {
                    router.push("/");
                }, 5000);
            }
        };

        fetchToken();
    }, [searchParams, router]);

    return (
        <>
            {error ? (
                <ErrorComponent error={error} />
            ) : (
                <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
                    <Card className="p-6 space-y-4 text-center">
                        <p
                            className={`${
                                success
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {success
                                ? "Success!"
                                : "Exchanging authorization code for access token..."}
                        </p>
                    </Card>
                </div>
            )}
        </>
    );
};

export default CallbackPage;
