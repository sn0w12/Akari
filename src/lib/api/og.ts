import { getBaseUrl } from "./base-url";

export function bg() {
    const baseUrl = getBaseUrl();
    const randomBg = Math.floor(Math.random() * 4) + 1;
    return `${baseUrl}/og/bg${randomBg}.jpg`;
}

export const palette = {
    background: "#0a0a0a",
    primary: "#e2e2e2",
    secondary: "#a1a1a1",

    score: "#6366f1",
    statusCompleted: "#155dfc",
    statusOngoing: "#00a63e",
    statusOther: "#4a5565",
};
