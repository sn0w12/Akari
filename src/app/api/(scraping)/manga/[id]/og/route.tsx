import { fetchMangaDetails } from "@/lib/scraping";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

const geistRegularFont = readFile(
    path.resolve(process.cwd(), "public/fonts/Geist-Regular.ttf"),
);
const geistBoldFont = readFile(
    path.resolve(process.cwd(), "public/fonts/Geist-Bold.ttf"),
);

const size = {
    width: 1200,
    height: 630,
};

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<ImageResponse> {
    const params = await props.params;
    const id = params.id;
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";
    const acceptLanguage =
        req.headers.get("accept-language") || "en-US,en;q=0.9";
    const palette = {
        background: "#0a0a0a",
        primary: "#e2e2e2",
        secondary: "#222222",

        score: "#fdc700",
        statusCompleted: "#155dfc",
        statusOngoing: "#00a63e",
        statusOther: "#4a5565",
    };

    const result = await fetchMangaDetails(id, userAgent, acceptLanguage);

    if ("error" in result) {
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
                        fontFamily: "Geist",
                        fontWeight: 900,
                        fontSize: 64,
                        letterSpacing: 2,
                    }}
                >
                    Not Found
                </div>
            ),
            {
                width: size.width,
                height: size.height,
                fonts: [
                    {
                        name: "Geist",
                        data: await geistBoldFont,
                        weight: 700,
                        style: "normal",
                    },
                ],
            },
        );
    }

    // Prepare data
    const cover = result.malData?.imageUrl ?? result.imageUrl;
    const title = result.name;
    const genres = result.genres;
    const score = result.malData?.score
        ? (result.malData.score / 2).toFixed(1)
        : (result.score?.toFixed?.(1) ?? "");
    const status = result.status;

    // Pick status color
    let statusBg = palette.statusOther;
    if (status?.toLowerCase() === "completed")
        statusBg = palette.statusCompleted;
    else if (status?.toLowerCase() === "ongoing")
        statusBg = palette.statusOngoing;

    // Get absolute URL for favicon
    const host =
        req.headers.get("x-forwarded-host") ||
        req.headers.get("host") ||
        "localhost:3000";
    const protocol =
        req.headers.get("x-forwarded-proto") ||
        (host.startsWith("localhost") ? "http" : "https");
    const faviconUrl = `${protocol}://${host}/img/icon.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: palette.background,
                    fontFamily: "Geist",
                    position: "relative",
                }}
            >
                {/* Cover */}
                <img
                    src={cover.replace(".webp", ".jpg")}
                    alt={title}
                    width={size.width}
                    style={{
                        filter: "blur(15px) brightness(0.5)",
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: size.width,
                        objectFit: "cover",
                        opacity: 0.25,
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
                        src={cover.replace(".webp", ".jpg")}
                        alt={title}
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
                        justifyContent: "flex-start",
                        padding: "32px",
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            fontSize: 56,
                            fontWeight: 900,
                            color: palette.primary,
                            lineHeight: 1.1,
                            maxWidth: 700,
                            overflow: "hidden",
                            wordBreak: "break-word",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                        }}
                    >
                        {/* Score */}
                        {score && (
                            <div
                                style={{
                                    display: "flex",
                                    background: palette.score,
                                    color: palette.background,
                                    fontWeight: 500,
                                    fontSize: 28,
                                    borderRadius: 64,
                                    padding: "8px 28px",
                                    letterSpacing: 1,
                                    fontFamily: "inherit",
                                }}
                            >
                                Score: {score}
                            </div>
                        )}
                        {/* Status */}
                        {status && (
                            <div
                                style={{
                                    display: "flex",
                                    background: statusBg,
                                    color: palette.primary,
                                    fontWeight: 500,
                                    fontSize: 28,
                                    borderRadius: 64,
                                    padding: "8px 28px",
                                    letterSpacing: 1,
                                    fontFamily: "inherit",
                                }}
                            >
                                {status}
                            </div>
                        )}
                    </div>
                    {/* Genres */}
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            flexWrap: "wrap",
                            marginTop: 16,
                        }}
                    >
                        {genres &&
                            genres.map((genre) => (
                                <div
                                    key={genre}
                                    style={{
                                        display: "flex",
                                        background: palette.secondary,
                                        color: palette.primary,
                                        fontWeight: 500,
                                        fontSize: 28,
                                        borderRadius: 64,
                                        padding: "8px 28px",
                                        letterSpacing: 1,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {genre}
                                </div>
                            ))}
                    </div>
                </div>
                {/* Favicon in bottom right */}
                <img
                    src={faviconUrl}
                    alt="Akari Manga Reader"
                    width={64}
                    height={64}
                    style={{
                        position: "absolute",
                        right: 32,
                        bottom: 32,
                        width: 64,
                        height: 64,
                    }}
                />
            </div>
        ),
        {
            width: size.width,
            height: size.height,
            fonts: [
                {
                    name: "Geist",
                    data: await geistRegularFont,
                    weight: 500,
                    style: "normal",
                },
                {
                    name: "Geist",
                    data: await geistBoldFont,
                    weight: 700,
                    style: "normal",
                },
            ],
        },
    );
}
