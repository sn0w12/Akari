const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map(Array.from(BASE58).map((c, i) => [c, i]));

function uuidToBytes(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, "");
    if (hex.length !== 32) throw new Error("Invalid UUID");

    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join("-");
}

export function compressUUIDBase58(uuid: string): string {
    const bytes = uuidToBytes(uuid);

    // convert bytes → big integer
    let num = BigInt(
        "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""),
    );

    if (num === 0n) return BASE58[0];

    let encoded = "";

    while (num > 0n) {
        const rem = Number(num % 58n);
        num /= 58n;
        encoded = BASE58[rem] + encoded;
    }

    return encoded;
}

export function decompressUUIDBase58(str: string): string {
    let num = 0n;

    for (const char of str) {
        const index = BASE58_INDEX.get(char);
        if (index === undefined) throw new Error("Invalid Base58");
        num = num * 58n + BigInt(index);
    }

    const hex = num.toString(16).padStart(32, "0");

    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return bytesToUuid(bytes);
}
