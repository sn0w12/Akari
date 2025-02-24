import { NextResponse } from "next/server";
import { generateCacheHeaders } from "@/lib/cache";
import { processMangaList } from "@/lib/mangaNato";

export const dynamic = "force-dynamic";

function parseDateString(dateStr: string | undefined): number {
    if (!dateStr) return 0;

    // Handle "Feb-23-2025 06:18" format
    const [datePart, timePart] = dateStr.split(" ");
    const [month, day, year] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");

    const date = new Date(
        parseInt(year),
        getMonthNumber(month),
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
    );
    return date.getTime();
}

function getMonthNumber(month: string): number {
    const months: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    return months[month] || 0;
}

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    try {
        const { searchParams } = new URL(request.url);
        const genre = params.id;
        const orderBy = searchParams.get("orderBy") || "latest";
        const page = searchParams.get("page") || "1";

        if (!genre) {
            return NextResponse.json(
                { result: "error", data: "No valid genre included in search" },
                { status: 400 },
            );
        }

        // Construct the search URL
        const searchUrl = `https://nelomanga.com/genre/${genre.toLowerCase()}?page=${page}&orby=${orderBy}`;
        const result = await processMangaList(searchUrl, page);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error fetching author search results:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
