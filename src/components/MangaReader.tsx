import { Chapter, SimpleError } from "@/app/api/interfaces";
import { HeaderComponent } from "@/components/Header";
import Reader from "./ui/MangaReader/reader";
import { getProductionUrl } from "@/app/api/baseUrl";
import ErrorComponent from "./ui/error";
import { getUserHeaders } from "@/lib/serverUtils";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export async function fetchChapter(id: string, subId: string) {
    const headersList = await getUserHeaders();
    const response = await fetch(
        `${getProductionUrl()}/api/manga/${id}/${subId}`,
        {
            headers: headersList,
        },
    );
    const data = await response.json();

    if (!response.ok) {
        return data as SimpleError;
    }
    const uniqueChapters: Chapter[] = Array.from(
        new Map<string, Chapter>(
            data.chapters.map((item: { value: string; label: string }) => [
                item.value,
                item,
            ]),
        ).values(),
    );
    data.chapters = uniqueChapters;
    return data;
}

export default async function ChapterReader({ id, subId }: ChapterReaderProps) {
    try {
        const chapterData = await fetchChapter(id, subId);

        if ("result" in chapterData) {
            throw new Error(chapterData.data);
        }

        return <Reader chapter={chapterData} />;
    } catch (error) {
        return (
            <>
                <HeaderComponent />
                <main className="p-8">
                    <ErrorComponent message={String(error)} />
                </main>
            </>
        );
    }
}
