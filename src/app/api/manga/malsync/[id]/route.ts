import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const apiEndpoint = `https://api.malsync.moe/page/MangaNato/${encodeURIComponent(id) || ""}`;

    try {
        const response = await axios.get(apiEndpoint);

        // Only return the response data, not the entire Axios response object
        return new NextResponse(JSON.stringify(response.data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error searching for manga:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
