"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Cookies from "js-cookie";

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
                const response = await fetch("/api/auth/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        code_verifier: codeVerifier,
                    }),
                });

                if (!response.ok) {
                    throw new Error(
                        "Failed to exchange authorization code for token",
                    );
                }

                const data = await response.json();

                setSuccess(true);
                Cookies.remove("pkce_code_verifier");

                const malResponse = await fetch("/api/mal/me", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: data.access_token,
                    }),
                });

                if (malResponse.ok) {
                    const malData = await malResponse.json();
                    localStorage.setItem("mal_user", JSON.stringify(malData));
                }

                // Redirect to homepage
                router.push("/");
            } catch (error) {
                setErrorMessage((error as Error).message);
                router.push("/");
            }
        };

        fetchToken();
    }, [searchParams, router]);

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
            <Card className="p-6 space-y-4 text-center">
                {errorMessage ? (
                    <p className="text-red-700">Error: {errorMessage}</p>
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
