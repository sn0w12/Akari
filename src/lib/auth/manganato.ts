import { SecondaryAccount } from "@/lib/auth/secondary-accounts";
import { fetchApi, isApiErrorResponse } from "../api";

export interface LoginResponse {
    success: boolean;
    data?: {
        username: string;
        [key: string]: unknown;
    };
    error?: string;
}

export async function fetchCaptcha() {
    try {
        const response = await fetchApi<{ captcha: string; cookies: string[] }>(
            "/api/v1/captcha"
        );

        if (isApiErrorResponse(response)) {
            throw new Error("Failed to fetch CAPTCHA.");
        }

        return {
            captchaUrl: response.data.captcha,
            cookies: response.data.cookies,
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
    cookies: string[]
): Promise<LoginResponse> {
    try {
        const response = await fetchApi<LoginResponse>("/api/v1/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
                captcha,
                cookies,
            }),
        });

        if (isApiErrorResponse(response)) {
            return {
                success: false,
                error: response.data.message,
            };
        }

        const data = response.data;
        if (data.success) {
            localStorage.setItem("accountName", username);
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

    await fetch("/api/logout");
}

export async function logoutSecondaryAccount(account: SecondaryAccount) {
    localStorage.removeItem(account.storageKey);
    sessionStorage.removeItem(account.sessionKey);
    await fetch(account.apiEndpoint);
}
