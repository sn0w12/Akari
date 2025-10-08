"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { fetchCaptcha, submitLogin } from "@/lib/auth/manganato";
import LoginView from "@/components/account/login-view";
import { formSchema } from "@/components/account/login-view";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [sessionCookies, setSessionCookies] = useState([""]);
    const [loginError, setLoginError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleFetchCaptcha = async () => {
        if (captchaUrl && sessionCookies.length > 0) {
            return;
        }

        try {
            const { captchaUrl: url, cookies: newCookies } =
                await fetchCaptcha();
            setCaptchaUrl(url);
            setSessionCookies(newCookies);
        } catch {
            setLoginError("Failed to fetch CAPTCHA.");
        }
    };

    useEffect(() => {
        // Check if user is already logged in
        const accountName = localStorage.getItem("accountName");
        if (accountName) {
            router.push("/account");
            return;
        }

        handleFetchCaptcha();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const response = await submitLogin(
                values.username,
                values.password,
                values.captcha,
                sessionCookies
            );
            if (response.success) {
                router.push("/account");
            } else {
                setLoginError(response.error || "Login failed");
            }
        } catch {
            setLoginError("An error occurred during login.");
        }

        setIsLoading(false);
    };

    return (
        <div className="mx-auto px-4 py-1 max-w-6xl flex-grow">
            <LoginView
                captchaUrl={captchaUrl}
                sessionCookies={sessionCookies}
                loginError={loginError}
                isLoading={isLoading}
                onSubmit={onSubmit}
                handleFetchCaptcha={handleFetchCaptcha}
            />
        </div>
    );
}
