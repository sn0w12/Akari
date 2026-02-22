import { getMangaChapters } from "@/components/manga-details/chapters";
import { permanentRedirect, redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").at(-2);
    if (!id) {
        redirect(`/`);
    }

    const { data, error } = await getMangaChapters(id);
    if (error || !data) {
        throw new Error("Failed to fetch chapters");
    }

    const chapters = data.data;
    if (chapters.length === 0) {
        throw new Error("No chapters found");
    }

    const firstChapter = chapters[chapters.length - 1].number;
    permanentRedirect(`/manga/${id}/${firstChapter}`);
}
