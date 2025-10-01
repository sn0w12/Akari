import { subtle } from "crypto";

export async function hashUsername(username: string, secretSalt: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(username + secretSalt);
    const hash = await subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function validateHash(
    username: string,
    hash: string,
    secretSalt: string
) {
    const newHash = await hashUsername(username, secretSalt);
    return newHash === hash;
}
