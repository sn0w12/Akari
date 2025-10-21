"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "./ui/puff-loader";
import { fetchCaptcha } from "@/lib/auth/manganato";
import { fetchApi, isApiErrorResponse } from "@/lib/api";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [display, setDisplay] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [captcha, setCaptcha] = useState("");
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [sessionCookies, setSessionCookies] = useState<string[]>([]);
    const router = useRouter();

    const handleFetchCaptcha = useCallback(async () => {
        if (captchaUrl && sessionCookies.length > 0) {
            return;
        }

        try {
            const { captchaUrl: url, cookies: cookies } = await fetchCaptcha();
            setCaptchaUrl(url);
            setSessionCookies(cookies);
        } catch {
            setError("Failed to fetch CAPTCHA.");
        }
    }, [
        captchaUrl,
        sessionCookies,
        setError,
        setCaptchaUrl,
        setSessionCookies,
    ]);

    useEffect(() => {
        handleFetchCaptcha();
    }, [handleFetchCaptcha]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetchApi("/api/v1/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    cookie: sessionCookies.join("; "),
                },
                body: JSON.stringify({
                    username,
                    password,
                    displayname: display,
                    email,
                    captcha,
                    cookies: sessionCookies,
                }),
            });

            if (isApiErrorResponse(response)) {
                setError(response.data.message || "Registration failed");
                handleFetchCaptcha();
                setIsLoading(false);
                return;
            }

            router.push("/account");
        } catch {
            setError("An error occurred during registration");
            handleFetchCaptcha(); // Refresh captcha on error
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto mt-8 mb-8 p-4 space-y-4 border rounded-lg"
        >
            <h1 className="text-2xl font-bold text-center border-b">
                Register
            </h1>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2"></div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                    type="text"
                    value={display}
                    onChange={(e) => setDisplay(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">CAPTCHA</label>
                <div className="flex items-center gap-2">
                    {!captchaUrl ? (
                        <div className="w-[100px] h-9 mr-2 flex-shrink-0">
                            <Skeleton className="w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-[100px] h-9 mr-2 flex-shrink-0">
                            <Image
                                src={captchaUrl}
                                loading="eager"
                                alt="CAPTCHA"
                                className="object-fill h-full"
                                width={100}
                                height={45}
                            />
                        </div>
                    )}
                    <Input
                        type="text"
                        value={captcha}
                        onChange={(e) => setCaptcha(e.target.value)}
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full">
                Register
            </Button>
        </form>
    );
}
