import { NextRequest } from "next/server";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { username, password, displayname, email, captcha, cookies } =
            await request.json();

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

        if (!username || !password || !displayname || !email || !captcha) {
            return createApiErrorResponse(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const registerResponse = await client.post(
            `https://${process.env.NEXT_MANGA_URL}/register`,
            new URLSearchParams({
                username: username,
                password: password,
                displayname: displayname,
                email: email,
                captcha: captcha,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    Referer: `https://${process.env.NEXT_MANGA_URL}/register`,
                    Origin: `https://${process.env.NEXT_MANGA_URL}`,
                    "Accept-Language": "en-US,en;q=0.5",
                },
                withCredentials: true,
            }
        );

        if (registerResponse.data.success != true) {
            let error = "Invalid credentials or token";
            if (registerResponse.data.errors) {
                error = Object.entries(registerResponse.data.errors)
                    .map(
                        ([field, messages]) =>
                            `${field}: ${(messages as string[]).join(", ")}`
                    )
                    .join("; ");
            }

            return createApiErrorResponse({ message: error }, { status: 400 });
        }

        const responseCookies = await jar.getCookies(
            `https://${process.env.NEXT_MANGA_URL}`
        );

        const setCookies = responseCookies.map((cookie) => cookie.toString());
        setCookies.push(
            `user_id=${registerResponse.data.data.id}; Path=/; Max-Age=2592000;`
        );

        const response = createApiResponse(registerResponse.data, {
            setCookies,
        });

        return response;
    } catch (error) {
        return createApiErrorResponse(
            {
                message: "Error processing register",
                details: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
