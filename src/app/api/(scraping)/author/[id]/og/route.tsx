/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { bg, palette } from "@/lib/og";
import path from "path";

const montserratBlackFont = readFile(
    path.resolve(process.cwd(), "public/fonts/Montserrat-Black.ttf"),
);

const size = {
    width: 1200,
    height: 630,
};

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;
    const authorId = params.id;
    const bgUrl = bg(request);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                        textAlign: "center",
                    }}
                >
                    {authorId.replaceAll("-", " ")}
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
        },
    );
}
