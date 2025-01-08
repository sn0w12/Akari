import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { username, password, display, captcha, email, ciSessionCookie } =
            await request.json();
        const cookieString = `${ciSessionCookie.key}=${ciSessionCookie.value}`;

        if (!username || !password || !captcha || !cookieString) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const jar = new CookieJar();
        await jar.setCookie(cookieString, "https://user.manganelo.com/");
        const client = wrapper(axios.create({ jar }));

        const loginResponse = await client.post(
            "https://user.manganelo.com/register_handle",
            new URLSearchParams({
                user: username,
                pass: password,
                display: display,
                captchar: captcha,
                email: email,
            }),
            {
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    Referer: "https://user.manganelo.com/register?l=manganato",
                    Origin: "https://user.manganelo.com",
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en,sv;q=0.9",
                    "X-Requested-With": "XMLHttpRequest",
                    "Sec-CH-UA":
                        '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                    "Sec-CH-UA-Mobile": "?0",
                    "Sec-CH-UA-Platform": '"Windows"',
                },
                withCredentials: true,
            },
        );

        if (loginResponse.data != "okie") {
            return NextResponse.json(
                { error: "Invalid credentials or CAPTCHA" },
                { status: 400 },
            );
        }

        return NextResponse.json({ success: true, data: loginResponse.data });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Error processing login",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
