import db from "@/lib/db";
import { SecondaryAccount } from "@/components/ui/Header/AccountDialog";

export interface LoginResponse {
    success: boolean;
    data?: {
        username: string;
        [key: string]: any;
    };
    error?: string;
}

export async function fetchCaptcha() {
    try {
        const response = await fetch("/api/login");
        const data = await response.json();
        return {
            captchaUrl: data.captcha,
            sessionCookies: data.cookies,
            token: data.token,
        };
    } catch (error) {
        console.error("Failed to fetch CAPTCHA:", error);
        throw new Error("Failed to fetch CAPTCHA.");
    }
}

export async function submitLogin(
    username: string,
    password: string,
    captcha: string,
    token: string,
    sessionCookies: string[],
): Promise<LoginResponse> {
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
                token,
                captcha,
                cookies: sessionCookies,
            }),
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem("accountName", data.data.username);
            localStorage.setItem("auth", JSON.stringify(data.data));
        }
        return data;
    } catch (error) {
        console.error("Failed to submit login:", error);
        return {
            success: false,
            error: "An error occurred during login.",
        };
    }
}

export async function logout(secondaryAccounts: SecondaryAccount[]) {
    // Clear primary account
    localStorage.removeItem("accountName");
    localStorage.removeItem("auth");

    // Clear secondary accounts
    secondaryAccounts.forEach((account) => {
        localStorage.removeItem(account.storageKey);
        sessionStorage.removeItem(account.sessionKey);
    });

    // Clear Caches
    db.clearCache(db.bookmarkCache);
    db.clearCache(db.mangaCache);
    db.clearCache(db.hqMangaCache);

    await fetch("/api/logout");
}

export async function logoutSecondaryAccount(account: SecondaryAccount) {
    localStorage.removeItem(account.storageKey);
    sessionStorage.removeItem(account.sessionKey);
    await fetch(account.apiEndpoint);
}
