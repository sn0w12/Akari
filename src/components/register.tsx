"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "./ui/puff-loader";
import { client } from "@/lib/api";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await client.POST("/v2/user/signup", {
                body: {
                    userName: username,
                    displayName: display,
                    email: email,
                    password: password,
                },
            });

            if (error) {
                setError(error.data.message || "Registration failed");
                setIsLoading(false);
                return;
            }

            router.push("/account");
        } catch {
            setError("An error occurred during registration");
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

            <Button type="submit" className="w-full">
                Register
            </Button>
        </form>
    );
}
