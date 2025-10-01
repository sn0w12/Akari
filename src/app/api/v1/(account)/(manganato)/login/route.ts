import { NextRequest } from "next/server";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

interface LoginResponseData {
    success: boolean;
    data?: {
        success: boolean;
        message: string;
    };
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {
    try {
        const { username, password, captcha, cookies } = await request.json();

        const jar = new CookieJar();
        const client = wrapper(
            axios.create({
                jar,
                validateStatus: () => true, // Allow any status code to be handled in the response
            })
        );
        await jar.removeAllCookies();

        if (cookies && Array.isArray(cookies)) {
            for (const cookieString of cookies) {
                await jar.setCookie(
                    cookieString,
                    `https://${process.env.NEXT_MANGA_URL}`
                );
            }
        }

        if (!username || !password) {
            return createApiErrorResponse(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const loginResponse = await client.post(
            `https://${process.env.NEXT_MANGA_URL}/login`,
            new URLSearchParams({
                username: username,
                password: password,
                captcha: captcha,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    Referer: `https://${process.env.NEXT_MANGA_URL}/login`,
                    Origin: `https://${process.env.NEXT_MANGA_URL}`,
                    "Accept-Language": "en-US,en;q=0.5",
                },
                withCredentials: true,
            }
        );

        const responseData = loginResponse.data as LoginResponseData;

        if (responseData.success !== true) {
            return createApiErrorResponse(
                { message: "Invalid credentials or token" },
                { status: 400 }
            );
        }

        const responseCookies = await jar.getCookies(
            `https://${process.env.NEXT_MANGA_URL}`
        );

        const response = createApiResponse(responseData, {
            setCookies: responseCookies.map((cookie) => cookie.toString()),
        });

        return response;
    } catch (error) {
        return createApiErrorResponse(
            {
                message: "Error processing login",
                details: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
