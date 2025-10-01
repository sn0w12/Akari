/* eslint-disable @next/next/no-img-element */
import { fetchMangaDetails } from "@/lib/manga/scraping";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { imageUrl } from "@/lib/utils";
import path from "path";
import sharp from "sharp";
import { bg, palette } from "@/lib/api/og";
import { isApiErrorData } from "@/lib/api";
import { generateCacheHeaders } from "@/lib/api";

const montserratBlackFont = readFile(
    path.resolve(process.cwd(), "public/fonts/Montserrat-Black.ttf")
);

const size = {
    width: 1200,
    height: 630,
};

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
): Promise<ImageResponse> {
    const params = await props.params;
    const id = params.id;
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";
    const acceptLanguage =
        req.headers.get("accept-language") || "en-US,en;q=0.9";
    const isDevelopment = process.env.NODE_ENV === "development";
    let host =
        req.headers.get("x-forwarded-host") ||
        req.headers.get("host") ||
        "localhost:3000";
    let protocol =
        req.headers.get("x-forwarded-proto") ||
        (host.startsWith("localhost") ? "http" : "https");

    if (!isDevelopment) {
        if (process.env.NEXT_PUBLIC_HOST) {
            host = process.env.NEXT_PUBLIC_HOST;
            protocol = "https";
        }
    }
    const baseUrl = `${protocol}://${host}`;
    const bgUrl = bg();

    const result = await fetchMangaDetails(id, userAgent, acceptLanguage);

    if (isApiErrorData(result)) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: palette.background,
                        color: palette.primary,
                        fontFamily: "Montserrat",
                    }}
                >
                    <img
                        src={bgUrl}
                        alt="Background"
                        width={size.width}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: size.width,
                            objectFit: "cover",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            fontSize: "10em",
                            fontWeight: 900,
                            color: palette.primary,
                            overflow: "hidden",
                            wordBreak: "break-word",
                            textShadow:
                                "0 0 10px rgba(226, 226, 226, 0.8), 0 0 20px rgba(226, 226, 226, 0.6), 0 0 30px rgba(226, 226, 226, 0.4)",
                        }}
                    >
                        Not Found
                    </div>
                </div>
            ),
            {
                width: size.width,
                height: size.height,
                fonts: [
                    {
                        name: "Montserrat",
                        data: await montserratBlackFont,
                        weight: 900,
                        style: "normal",
                    },
                ],
            }
        );
    }

    // Prepare data
    const cover = result.malData?.image ?? result.imageUrl;
    const title = result.name;
    const authors =
        Array.isArray(result.authors) &&
        result.authors.length === 1 &&
        result.authors[0] === "Unknown"
            ? []
            : result.authors;
    const score = result.malData?.score
        ? (result.malData.score / 2).toFixed(1)
        : result.score?.toFixed?.(1) ?? "";

    let coverDataUrl = "";
    try {
        const coverResponse = await fetch(imageUrl(cover, baseUrl));
        if (!coverResponse.ok) throw new Error("Failed to fetch cover");
        const coverBuffer = await coverResponse.arrayBuffer();
        const image = sharp(Buffer.from(coverBuffer));
        const metadata = await image.metadata();
        if (metadata.format === "webp") {
            // Convert WebP to PNG
            const pngBuffer = await image.png().toBuffer();
            coverDataUrl = `data:image/png;base64,${pngBuffer.toString(
                "base64"
            )}`;
        } else {
            // Use original if not WebP
            coverDataUrl = `data:image/${metadata.format};base64,${Buffer.from(
                coverBuffer
            ).toString("base64")}`;
        }
    } catch (error) {
        console.error("Error processing cover image:", error);
        // Fallback: Use original URL if conversion fails
        coverDataUrl = imageUrl(cover, baseUrl);
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: palette.background,
                    fontFamily: "Montserrat",
                    position: "relative",
                }}
            >
                {/* Cover */}
                <img
                    src={bgUrl}
                    width={size.width}
                    alt="Background"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: size.width,
                        objectFit: "cover",
                    }}
                />
                <div
                    style={{
                        flex: "0 0 420px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: palette.background,
                    }}
                >
                    <img
                        src={coverDataUrl}
                        alt="Cover"
                        width={420}
                        height={size.height}
                        style={{
                            objectFit: "cover",
                        }}
                    />
                </div>
                {/* Details */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "32px",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                fontSize: 70,
                                fontWeight: 900,
                                color: palette.primary,
                                lineHeight: 1.1,
                                maxWidth: 700,
                                overflow: "hidden",
                                wordBreak: "break-word",
                                textShadow:
                                    "0 0 10px rgba(226, 226, 226, 0.8), 0 0 20px rgba(226, 226, 226, 0.6), 0 0 30px rgba(226, 226, 226, 0.4)",
                            }}
                        >
                            {title}
                        </div>
                        {authors && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 4,
                                    fontSize: 50,
                                    fontWeight: 700,
                                    color: palette.secondary,
                                    textShadow:
                                        "0 0 10px rgba(161, 161, 161, 0.8), 0 0 20px rgba(161, 161, 161, 0.6), 0 0 30px rgba(161, 161, 161, 0.4)",
                                }}
                            >
                                {authors.map((author) => (
                                    <span key={author}>{author}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Details */}
                    {score && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 8,
                                fontSize: 60,
                                fontWeight: 700,
                                color: palette.score,
                            }}
                        >
                            <span
                                style={{
                                    textShadow:
                                        "0 0 10px rgba(99, 102, 241, 0.8), 0 0 20px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.4)",
                                }}
                            >
                                {score}/5
                            </span>
                        </div>
                    )}
                </div>
            </div>
        ),
        {
            width: size.width,
            height: size.height,
            fonts: [
                {
                    name: "Montserrat",
                    data: await montserratBlackFont,
                    weight: 900,
                    style: "normal",
                },
            ],
            headers: Object.fromEntries(
                generateCacheHeaders(2_592_000).map(({ key, value }) => [
                    key,
                    value,
                ])
            ),
        }
    );
}
