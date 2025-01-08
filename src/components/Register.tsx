"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";

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
    const [ciSessionCookie, setCiSessionCookie] = useState("");
    const router = useRouter();

    const fetchCaptcha = async () => {
        if (captchaUrl && ciSessionCookie) {
            return;
        }

        try {
            const response = await fetch("/api/register/captcha");
            const data = await response.json();
            setCaptchaUrl(data.captchaUrl);
            setCiSessionCookie(data.ciSessionCookie[0]);
        } catch (error) {
            console.error("Failed to fetch CAPTCHA:", error);
            setError("Failed to fetch CAPTCHA.");
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/register/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    cookie: ciSessionCookie,
                },
                body: JSON.stringify({
                    username,
                    password,
                    display,
                    email,
                    captcha,
                    ciSessionCookie,
                }),
            });

            if (response.ok) {
                router.push("/?account=true");
            } else {
                const data = await response.json();
                setError(data.message || "Registration failed");
                fetchCaptcha(); // Refresh captcha on error
            }
        } catch (err) {
            setError("An error occurred during registration");
            fetchCaptcha(); // Refresh captcha on error
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return <CenteredSpinner />;
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
                        <div className="w-[100px] h-[45px] flex-shrink-0">
                            <Skeleton className="w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-[100px] h-[45px] flex-shrink-0">
                            <Image
                                src={`/api/image-proxy?imageUrl=${captchaUrl}`}
                                loading="eager"
                                alt="CAPTCHA"
                                className="max-w-full max-h-full object-contain"
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
