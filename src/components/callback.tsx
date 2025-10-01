"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Cookies from "js-cookie";
import ErrorComponent from "./error-page";
import { fetchApi, isApiErrorResponse } from "@/lib/api";

const CallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        const code = searchParams.get("code");
        const codeVerifier = Cookies.get("pkce_code_verifier");

        if (!code || !codeVerifier) {
            setErrorMessage("Missing code or code verifier");
            return;
        }

        // Send request to exchange code for tokens
        const fetchToken = async () => {
            try {
                const tokenResponse = await fetchApi<{
                    access_token: string;
                    refresh_token: string;
                    expires_in: number;
                }>("/api/v1/mal/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        code_verifier: codeVerifier,
                    }),
                });

                if (isApiErrorResponse(tokenResponse)) {
                    throw new Error(tokenResponse.data.message);
                }

                const data = tokenResponse.data;

                setSuccess(true);
                Cookies.remove("pkce_code_verifier");

                const malResponse = await fetchApi("/api/v1/mal/me", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: data.access_token,
                    }),
                });

                if (!isApiErrorResponse(malResponse)) {
                    const malData = malResponse.data;
                    localStorage.setItem("mal_user", JSON.stringify(malData));
                    sessionStorage.setItem("mal", "true");
                }

                // Redirect to homepage
                router.push("/");
            } catch (error) {
                setErrorMessage((error as Error).message);
                setTimeout(() => {
                    router.push("/");
                }, 5000);
            }
        };

        fetchToken();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
            <Card className="p-6 space-y-4 text-center">
                {errorMessage ? (
                    <ErrorComponent message={errorMessage} />
                ) : (
                    <p
                        className={`${
                            success ? "text-green-500" : "text-muted-foreground"
                        }`}
                    >
                        {success
                            ? "Success!"
                            : "Exchanging authorization code for access token..."}
                    </p>
                )}
            </Card>
        </div>
    );
};

export default CallbackPage;
