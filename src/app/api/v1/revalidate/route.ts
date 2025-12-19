import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidateBody {
    secret: string;
    pages: string[];
}

export async function POST(req: NextRequest) {
    const body: RevalidateBody = await req.json();
    const { secret, pages } = body;

    if (secret !== process.env.API_KEY) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (
        !pages ||
        !Array.isArray(pages) ||
        pages.length === 0 ||
        !pages.every(
            (page) =>
                typeof page === "string" &&
                page.trim() !== "" &&
                page.startsWith("/")
        )
    ) {
        return NextResponse.json(
            { message: "Missing or invalid pages parameter" },
            { status: 400 }
        );
    }

    try {
        for (const page of pages) {
            revalidatePath(page);
        }
        revalidateTag("home", "max");
        return NextResponse.json({ revalidated: true });
    } catch {
        return NextResponse.json(
            { message: "Error revalidating" },
            { status: 500 }
        );
    }
}
