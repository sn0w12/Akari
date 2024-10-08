import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export const fetchCache = "force-no-store";

export async function GET() {
    try {
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));

        const loginPageResponse = await client.get(
            "https://user.manganelo.com/login?l=manganato&re_l=login",
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
                },
            },
        );

        // Step 2: Parse the CAPTCHA URL from the HTML
        const $ = cheerio.load(loginPageResponse.data);
        const captchaParent = $(".captchar");
        const captchaUrl = captchaParent.find("img").attr("src");

        if (!captchaUrl) {
            return NextResponse.json(
                { error: "Failed to retrieve CAPTCHA image" },
                { status: 400 },
            );
        }

        // Step 3: Return both the CAPTCHA URL and the session cookie to the client
        return NextResponse.json({
            captchaUrl,
            ciSessionCookie: await jar.getCookies("https://user.manganelo.com"),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Error fetching login page",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
