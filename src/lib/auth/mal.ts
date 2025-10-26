export function generateCodeVerifier(length = 128): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
        codeVerifier += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return codeVerifier;
}

export function generateCodeChallenge(codeVerifier: string): string {
    // MAL requires the plain method, so the challenge is the same as the verifier
    return codeVerifier;
}
