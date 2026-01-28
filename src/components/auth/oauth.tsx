"use client";

import { useState } from "react";
import { createClient } from "@/lib/auth/client";
import { Provider } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const providers = [
    {
        name: "Google",
        provider: "google" as Provider,
        icon: (
            <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Google</title>
                <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
            </svg>
        ),
    },
];

export function Providers() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialLogin = async (provider: Provider) => {
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/oauth`,
                },
            });

            if (error) throw error;
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred",
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2">
                <div
                    data-orientation="horizontal"
                    data-slot="separator"
                    className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px absolute inset-0 top-1/2"
                />
                <span className="bg-card text-muted-foreground relative mx-auto block w-fit px-2">
                    Or continue with
                </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {providers.map((p) => (
                    <Button
                        key={p.provider}
                        variant="outline"
                        onClick={() => handleSocialLogin(p.provider)}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {p.icon}
                        Login with {p.name}
                    </Button>
                ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
