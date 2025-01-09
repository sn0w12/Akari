import { headers } from "next/headers";

export async function getUserHeaders() {
    let headersList: { [key: string]: string } = {};
    try {
        const headerEntries = Array.from((await headers()).entries());
        headersList = headerEntries.reduce(
            (acc: { [key: string]: string }, [key, value]) => {
                // Skip problematic headers
                if (
                    key.toLowerCase() === "connection" ||
                    key.toLowerCase() === "transfer-encoding" ||
                    key.toLowerCase() === "keep-alive"
                ) {
                    return acc;
                }
                acc[key] = value;
                return acc;
            },
            {} as { [key: string]: string },
        );
    } catch (headerError) {
        console.log("Could not get headers:", headerError);
    }
    return headersList;
}
