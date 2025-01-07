import { Chapter } from "@/app/api/interfaces";
import Reader from "./ui/MangaReader/reader";
import ErrorComponent from "./ui/error";
import { fetchChapterData } from "@/app/api/manga/[id]/[subId]/route";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export default async function ChapterReader({ id, subId }: ChapterReaderProps) {
    let chapterData: Chapter | undefined;
    let errorMessage = "";
    try {
        chapterData = await fetchChapterData(id, subId);
    } catch (error) {
        errorMessage = String(error);
        console.error("Error fetching chapter data:", error);
    }

    if (!chapterData) {
        return <ErrorComponent message={errorMessage} />;
    }

    return <Reader chapter={chapterData} />;
}
