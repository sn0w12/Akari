import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const jar = new CookieJar();
    const client = wrapper(
        axios.create({
            jar,
            responseType: "arraybuffer",
        }),
    );

    const registerPage = await client.get(
        `https://${process.env.NEXT_MANGA_URL}/register`,
        {
            withCredentials: true,
        },
    );

    const $ = cheerio.load(registerPage.data);
    const form = $("#register_form");
    const token = form.find('input[name="_token"]').attr("value");
    const captchaDiv = $(".captchar");
    const captchaUrl = captchaDiv.find("img").attr("src");

    if (!captchaUrl) {
        return NextResponse.json(
            { error: "Failed to retrieve captcha image" },
            { status: 500 },
        );
    }

    // Fetch the actual captcha image
    const captchaResponse = await client.get(captchaUrl, {
        withCredentials: true,
        responseType: "arraybuffer",
    });

    // Convert the image to base64
    const base64Image = Buffer.from(captchaResponse.data).toString("base64");
    const captchaBase64 = `data:image/webp;base64,${base64Image}`;

    const cookies = await jar.getCookies(
        `https://${process.env.NEXT_MANGA_URL}`,
    );

    const response = NextResponse.json({
        token: token,
        captcha: captchaBase64,
        cookies: cookies.map((cookie) => cookie.toString()),
    });

    cookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie.toString());
    });

    return response;
}

export async function POST(request: NextRequest) {
    try {
        const {
            username,
            password,
            displayname,
            email,
            captcha,
            cookies,
            token,
        } = await request.json();

        const jar = new CookieJar();
        const client = wrapper(
            axios.create({
                jar,
                validateStatus: (status) => true, // Allow any status code to be handled in the response
            }),
        );
        await jar.removeAllCookies();

        if (cookies && Array.isArray(cookies)) {
            for (const cookieString of cookies) {
                await jar.setCookie(
                    cookieString,
                    `https://${process.env.NEXT_MANGA_URL}`,
                );
            }
        }

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

        const registerResponse = await client.post(
            `https://${process.env.NEXT_MANGA_URL}/register`,
            new URLSearchParams({
                username: username,
                password: password,
                displayname: displayname,
                email: email,
                _token: token,
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
            },
        );

        if (registerResponse.data.success != true) {
            let error = "Invalid credentials or token";
            if (registerResponse.data.errors) {
                error = Object.entries(registerResponse.data.errors)
                    .map(
                        ([field, messages]) =>
                            `${field}: ${(messages as string[]).join(", ")}`,
                    )
                    .join("; ");
            }

            return NextResponse.json({ error: error }, { status: 400 });
        }

        const response = NextResponse.json(registerResponse.data);
        const responseCookies = await jar.getCookies(
            `https://${process.env.NEXT_MANGA_URL}`,
        );
        responseCookies.forEach((cookie) => {
            response.headers.append("Set-Cookie", cookie.toString());
        });

        response.headers.append(
            "Set-Cookie",
            `user_id=${registerResponse.data.data.id}; Path=/; Max-Age=2592000;`,
        );

        return response;
    } catch (error) {
        return NextResponse.json(
            {
                error: "Error processing register",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
