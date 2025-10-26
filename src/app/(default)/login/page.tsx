"use client";

import { z } from "zod";
import { useState } from "react";
import { submitLogin } from "@/lib/auth/akari";
import LoginView from "@/components/account/login-view";
import { formSchema } from "@/components/account/login-view";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const response = await submitLogin(values.email, values.password);
            if (response) {
                router.push("/account");
            }
        } catch {
            setLoginError("An error occurred during login.");
        }

        setIsLoading(false);
    };

    return (
        <div className="mx-auto px-4 py-1 max-w-6xl flex-grow">
            <LoginView
                loginError={loginError}
                isLoading={isLoading}
                onSubmit={onSubmit}
            />
        </div>
    );
}
