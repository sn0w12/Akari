export const baseUrl =
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : `https://${window.location.hostname}`;
