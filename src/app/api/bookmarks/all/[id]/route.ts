import { NextResponse } from "next/server";
import { getBaseUrl } from "@/app/api/baseUrl";

export const runtime = "edge";

// Function to fetch bookmarks from the external API
async function fetchBookmarks(user_data: string, page: number) {
    try {
        const response = await fetch(
            `${getBaseUrl()}/api/bookmarks?page=${page}&user_data=${user_data}`,
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        return { result: "error", error: (error as Error).message };
    }
}

// Named export for GET requests (you can also use POST if needed)
export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    const user_data = params.id;

    if (!user_data) {
        return NextResponse.json(
            { message: "user_data is required" },
            { status: 400 },
        );
    }

    const readableStream = new ReadableStream({
        async start(controller) {
            let currentPage = 1;

            try {
                while (true) {
                    const result = await fetchBookmarks(user_data, currentPage);

                    if (result.result === "error") {
                        controller.error(result.error);
                        return;
                    }

                    const bookmarks = result.bookmarks;

                    for (const bookmark of bookmarks) {
                        const data = `data: ${JSON.stringify(bookmark)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                    }

                    const finalPage = result.totalPages;

                    if (currentPage >= finalPage) {
                        const stopEvent = `event: stop\ndata: \n\n`;
                        controller.enqueue(new TextEncoder().encode(stopEvent));
                        controller.close();
                        break;
                    }

                    currentPage++;
                }
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new NextResponse(readableStream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
