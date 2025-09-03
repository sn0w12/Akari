export function bg(req: Request) {
    const isDevelopment = process.env.NODE_ENV === "development";
    let host =
        req.headers.get("x-forwarded-host") ||
        req.headers.get("host") ||
        "localhost:3000";
    let protocol =
        req.headers.get("x-forwarded-proto") ||
        (host.startsWith("localhost") ? "http" : "https");

    if (!isDevelopment) {
        if (process.env.NEXT_HOST) {
            host = process.env.NEXT_HOST;
            protocol = "https";
        }
    }

    const baseUrl = `${protocol}://${host}`;
    const randomBg = Math.floor(Math.random() * 4) + 1;
    return `${baseUrl}/og/bg${randomBg}.jpg`;
}

export const palette = {
    background: "#0a0a0a",
    primary: "#e2e2e2",
    secondary: "#a1a1a1",

    score: "#fdc700",
    statusCompleted: "#155dfc",
    statusOngoing: "#00a63e",
    statusOther: "#4a5565",
};
