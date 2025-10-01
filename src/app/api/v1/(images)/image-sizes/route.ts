import { createApiResponse, createApiErrorResponse } from "@/lib/api";
import probe from "probe-image-size";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    let baseUrl = searchParams.get("baseUrl");
    const imgs = searchParams.get("imgs")?.split(",") || [];

    if (!baseUrl || imgs.length === 0) {
        return createApiErrorResponse(
            { message: "Missing baseUrl or imgs parameter" },
            { status: 400 }
        );
    }

    if (imgs.length > 30) {
        return createApiErrorResponse(
            { message: "Too many images requested. Max is 30." },
            { status: 400 }
        );
    }

    if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
    }

    try {
        const results = await Promise.allSettled(
            imgs.map(async (img) => {
                const url = new URL(img, baseUrl).toString();
                const { width, height } = await probe(url, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                        Accept: "image/avif,image/jxl,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Accept-Encoding": "gzip, deflate, br, zstd",
                        "Sec-GPC": "1",
                        Connection: "keep-alive",
                        Referer: `https://${process.env.NEXT_MANGA_URL}/`,
                        "Sec-Fetch-Dest": "image",
                        "Sec-Fetch-Mode": "no-cors",
                        "Sec-Fetch-Site": "cross-site",
                    },
                    timeout: 500,
                });
                return { url, width, height };
            })
        );

        const sizes = results.map((result) =>
            result.status === "fulfilled"
                ? result.value
                : {
                      url: result.reason?.url || "unknown",
                      error: result.reason?.message || "Failed to probe",
                  }
        );

        return createApiResponse(sizes, { cacheTime: "14 days" });
    } catch (error) {
        console.log(error);
        return createApiErrorResponse(
            {
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
