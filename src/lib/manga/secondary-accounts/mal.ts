import { fetchApi, isApiErrorResponse } from "@/lib/api";

export async function syncMal(
    id: number,
    num_chapters_read: string,
    retry: boolean = true
) {
    const maxRetries = 1;
    const retryDelay = 200000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetchApi("/api/v1/mal/me/mangalist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    manga_id: id,
                    num_chapters_read,
                }),
            });

            if (isApiErrorResponse(response)) {
                throw new Error(response.data.message);
            }

            return response.data;
        } catch (error) {
            if (attempt < maxRetries && retry) {
                console.warn(`Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                continue;
            }
            throw error;
        }
    }
}
