export const baseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : `https://${typeof window !== "undefined" ? window.location.hostname : "default-hostname"}`;

export const akariUrls = [
    "akari-psi.vercel.app",
    "akari-git-dev-lucas-projects-b0648cb1.vercel.app",
];
