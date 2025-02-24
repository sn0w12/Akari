import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));
        await jar.removeAllCookies();

        const loginPageResponse = await client.get(
            `https://www.nelomanga.com/login`,
            {
                withCredentials: true,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    Referer:
                        "https://user.manganelo.com/login?l=manganato&re_l=login",
                    "Sec-CH-UA":
                        '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                    "Sec-CH-UA-Mobile": "?0",
                    "Sec-CH-UA-Platform": '"Windows"',
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            },
        );

        // Step 2: Parse the CAPTCHA URL from the HTML
        const $ = cheerio.load(loginPageResponse.data);
        const form = $("#login_form");
        const token = form.find('input[name="_token"]').attr("value");

        if (!token) {
            return NextResponse.json(
                { error: "Failed to retrieve token" },
                { status: 400 },
            );
        }

        if (!username || !password || !token) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const loginResponse = await client.post(
            "https://www.nelomanga.com/login",
            new URLSearchParams({
                username: username,
                password: password,
                _token: token,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    Referer: "https://www.nelomanga.com/login",
                    Origin: "https://www.nelomanga.com",
                    "Accept-Language": "en-US,en;q=0.5",
                },
                withCredentials: true,
            },
        );

        if (loginResponse.data.success != true) {
            return NextResponse.json(
                { error: "Invalid credentials or token" },
                { status: 400 },
            );
        }

        const response = NextResponse.json(loginResponse.data);
        const cookies = await jar.getCookies("https://www.nelomanga.com");
        cookies.forEach((cookie) => {
            response.headers.append("Set-Cookie", cookie.toString());
        });

        return response;
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
