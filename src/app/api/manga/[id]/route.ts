import axios from "axios";
import NodeCache from "node-cache";
import { generateCacheHeaders } from "@/lib/cache";
import { scrapeMangaDetails } from "@/lib/mangaNato";

const cache = new NodeCache({ stdTTL: 10 * 60 }); // 10 minutes

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const cacheKey = `mangaDetails_${id}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(300),
            },
        });
    }

    try {
        const mangaDetails = await scrapeMangaDetails(id);
        if ("result" in mangaDetails) {
            return new Response(
                JSON.stringify({
                    error: {
                        message: mangaDetails.result,
                        code: 404,
                    },
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        if (mangaDetails.storyData) {
            cache.set(cacheKey, mangaDetails);
        }

        return new Response(JSON.stringify(mangaDetails), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(300),
            },
        });
    } catch (error) {
        console.error(
            "Error fetching manga details:",
            (error as Error).message,
        );

        let errorMessage =
            "An unexpected error occurred while fetching manga details";
        let statusCode = 500;

        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Response headers:", error.response?.headers);

            switch (error.response?.status) {
                case 404:
                    errorMessage = "Manga not found";
                    statusCode = 404;
                    break;
                case 429:
                    errorMessage = "Too many requests, please try again later";
                    statusCode = 429;
                    break;
                case 403:
                    errorMessage =
                        "Access denied. Please check your credentials";
                    statusCode = 403;
                    break;
            }
        }

        return new Response(
            JSON.stringify({
                error: {
                    message: errorMessage,
                    details: (error as Error).message,
                    code: statusCode,
                },
            }),
            {
                status: statusCode,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
