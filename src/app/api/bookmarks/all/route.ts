import { NextResponse } from "next/server";

export const runtime = "edge";

// Function to fetch bookmarks from the external API
async function fetchBookmarks(user_data: string, page: number) {
    const apiBaseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000";
    console.log("apiBaseUrl:", apiBaseUrl);
    const response = await fetch(
        `${apiBaseUrl}/api/bookmarks?page=${page}&user_data=${user_data}`,
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const jsonResponse = await response.json();
    jsonResponse["result"] = "ok";
    return jsonResponse;
}

// Named export for GET requests (you can also use POST if needed)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_data = searchParams.get("user_data");

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

                    if (result.result !== "ok") {
                        controller.error(new Error("Error fetching bookmarks"));
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

    return new Response(readableStream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
