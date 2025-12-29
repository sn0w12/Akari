import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidateBody {
    secret: string;
    pages: string[] | undefined;
    tags: string[] | undefined;
}

export async function POST(req: NextRequest) {
    const body: RevalidateBody = await req.json();
    const { secret, pages, tags } = body;

    if (secret !== process.env.API_KEY) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const invalidPages =
        !pages ||
        !Array.isArray(pages) ||
        pages.length === 0 ||
        !pages.every(
            (page) =>
                typeof page === "string" &&
                page.trim() !== "" &&
                page.startsWith("/")
        );
    const invalidTags = !tags || !Array.isArray(tags) || tags.length === 0;

    if (invalidPages || invalidTags) {
        return NextResponse.json(
            { message: "Missing or invalid pages or tags parameter" },
            { status: 400 }
        );
    }

    try {
        for (const page of pages) {
            revalidatePath(page);
        }
        for (const tag of tags) {
            revalidateTag(tag, "max");
        }
        revalidatePath("/");
        return NextResponse.json({ revalidated: true });
    } catch {
        return NextResponse.json(
            { message: "Error revalidating" },
            { status: 500 }
        );
    }
}
