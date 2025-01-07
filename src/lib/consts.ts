export const baseUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : `https://${typeof window !== "undefined" ? window.location.hostname : "default-hostname"}`;
