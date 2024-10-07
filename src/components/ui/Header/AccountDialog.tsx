import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import React from "react";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";

export default function LoginDialog() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captcha, setCaptcha] = useState("");
    const [captchaUrl, setCaptchaUrl] = useState("");
    const [ciSessionCookie, setCiSessionCookie] = useState("");
    const [loginError, setLoginError] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [authUrl, setAuthUrl] = useState<string | null>(null);
    const [isMalAuth, setIsMalAuth] = useState<boolean>(false);
    const [malUser, setMalUser] = useState<MalUser | null>(null);

    interface UserData {
        user_name: string;
        user_data: string;
        user_image: string;
    }

    interface MalUser {
        name: string;
        picture: string;
        id: number;
    }

    // Check if the user_acc cookie exists in localStorage and parse it
    useEffect(() => {
        const userAccCookie = localStorage.getItem("user_acc");
        if (userAccCookie) {
            try {
                // Decode and parse the user_acc cookie value
                const decodedCookie = decodeURIComponent(userAccCookie);
                const parsedData = JSON.parse(decodedCookie);

                // Set the user's name and data from the parsed user_acc cookie
                setUserData(parsedData);
            } catch (error) {
                console.error("Failed to parse user_acc cookie:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        // Manganato
        localStorage.removeItem("accountInfo");
        localStorage.removeItem("accountName");
        localStorage.removeItem("user_acc");
        setUserData(null); // Reset userData to trigger the login view again
        fetchCaptcha(); // Fetch a new CAPTCHA when logging out

        // MyAnimeList
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        localStorage.removeItem("mal_user");
        setMalUser(null);
        setIsMalAuth(false);
    };

    // Fetch CAPTCHA when opening the dialog
    const fetchCaptcha = async () => {
        try {
            const response = await fetch("/api/login/captcha");
            const data = await response.json();
            setCaptchaUrl(data.captchaUrl);
            setCiSessionCookie(data.ciSessionCookie[0]);
        } catch (error) {
            console.error("Failed to fetch CAPTCHA:", error);
            setLoginError("Failed to fetch CAPTCHA.");
        }
    };

    // Submit login with CAPTCHA, username, and password
    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/login/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    cookie: ciSessionCookie,
                },
                body: JSON.stringify({
                    username,
                    password,
                    captcha,
                    ciSessionCookie,
                }),
            });

            const data = await response.json();
            if (data.userAccCookie) {
                localStorage.setItem("user_acc", data.userAccCookie);
                console.log("user_acc cookie saved:", data.userAccCookie);

                // Decode and parse the user_acc cookie value to update user data
                const parsedData = JSON.parse(data.userAccCookie);
                localStorage.setItem("accountInfo", parsedData.user_data);
                localStorage.setItem("accountName", parsedData.user_name);
                setUserData(parsedData);
            } else {
                setLoginError(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Failed to submit login:", error);
            setLoginError("An error occurred during login.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const malUser = JSON.parse(localStorage.getItem("mal_user") || "{}");
        if (malUser.name) {
            setMalUser(malUser);
            setIsMalAuth(true);
            return;
        } else {
            setIsMalAuth(false);
        }

        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;

        // Store the codeVerifier in a cookie
        Cookies.set("pkce_code_verifier", codeVerifier, { sameSite: "strict" });

        const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
        url.searchParams.append("response_type", "code");
        url.searchParams.append("client_id", clientId);
        url.searchParams.append("code_challenge", codeChallenge);
        url.searchParams.append("code_challenge_method", "plain");
        url.searchParams.append("redirect_uri", `${baseUrl}/auth/callback`);

        setAuthUrl(url.toString());
    }, []);

    const handleOpenChange = (
        open: boolean | ((prevState: boolean) => boolean),
    ) => {
        if (open) {
            fetchCaptcha();
        }
    };

    // If user data exists, display the user's name and user data, otherwise show the login dialog
    if (userData) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Account Information</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center space-x-4 mb-4 border-t">
                        <div className="mt-4 w-full">
                            <h2 className="text-xl font-bold">
                                {userData.user_name}
                            </h2>
                            <label className="block text-sm font-medium mb-2 mt-2">
                                User Data
                            </label>
                            <Input
                                type="text"
                                placeholder="User Data..."
                                className="w-full"
                                value={userData.user_data}
                                readOnly
                            />

                            {authUrl && !isMalAuth && (
                                <a href={authUrl}>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full bg-blue-600 hover:bg-blue-500"
                                    >
                                        MyAnimeList
                                    </Button>
                                </a>
                            )}
                            {isMalAuth && malUser && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold">
                                        {malUser.name}
                                    </h2>
                                    <p className="mt-2">Logged In With Mal</p>
                                </div>
                            )}
                            {/* Logout Button */}
                            <ConfirmDialog
                                triggerButton={
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full bg-red-600 hover:bg-red-500"
                                    >
                                        Logout
                                    </Button>
                                }
                                title="Confirm Logout"
                                message="Are you sure you want to logout?"
                                confirmLabel="Logout"
                                confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                cancelLabel="Cancel"
                                onConfirm={handleLogout}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Show the login form if the user is not logged in
    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                {isLoading && <CenteredSpinner />}
                {!isLoading && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Login</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-4 mb-4 border-t">
                            <div className="mt-4 w-full">
                                {/* Username Field */}
                                <label className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Username..."
                                    className="w-full"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />

                                {/* Password Field */}
                                <label className="block text-sm font-medium mb-2 mt-2">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Password..."
                                    className="w-full"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />

                                {/* CAPTCHA Field */}
                                {!captchaUrl && <CenteredSpinner />}
                                {captchaUrl && (
                                    <div className="mt-4 flex flex-col">
                                        <label className="block text-sm font-medium mb-2">
                                            CAPTCHA
                                        </label>
                                        <div className="flex items-center w-full">
                                            <img
                                                src={`/api/image-proxy?imageUrl=${captchaUrl}`}
                                                alt="CAPTCHA"
                                                className="mr-2 w-auto h-full"
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Enter CAPTCHA..."
                                                className="w-full"
                                                value={captcha}
                                                onChange={(e) =>
                                                    setCaptcha(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    className="mt-4 w-full"
                                    onClick={handleSubmit}
                                >
                                    Login
                                </Button>

                                {/* Error Message */}
                                {loginError && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {loginError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
