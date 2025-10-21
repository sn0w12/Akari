import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { createApiResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
    const jar = new CookieJar();
    const client = wrapper(
        axios.create({
            jar,
            responseType: "arraybuffer",
        })
    );

    // Fetch the actual captcha image
    const captchaResponse = await client.get(
        `https://${process.env.NEXT_MANGA_URL}/captcha`,
        {
            withCredentials: true,
        }
    );

    // Parse HTML and extract <img> src
    const html = captchaResponse.data.toString();
    const match = html.match(/<img[^>]*src="([^"]*)"/i);
    const captchaSrc = match ? match[1] : undefined;

    const cookies = await jar.getCookies(
        `https://${process.env.NEXT_MANGA_URL}`
    );

    const response = createApiResponse(
        {
            captcha: captchaSrc,
            cookies: cookies.map((cookie) => cookie.toString()),
        },
        {
            setCookies: cookies.map((cookie) => cookie.toString()),
        }
    );

    return response;
}
