import { HeaderComponent } from "@/components/Header";
import { Reader } from "./ui/MangaReader/reader";
import ErrorComponent from "./ui/error";
import { fetchChapterData } from "@/lib/scraping";
import { unstable_cacheLife as cacheLife } from "next/cache";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export default async function ChapterReader({ id, subId }: ChapterReaderProps) {
    "use cache";
    cacheLife("days");

    try {
        const chapterData = await fetchChapterData(id, subId);

        if ("result" in chapterData) {
            throw new Error(chapterData.data);
        }

        return <Reader chapter={chapterData} />;
    } catch (error) {
        return (
            <>
                <HeaderComponent />
                <div className="p-8">
                    <ErrorComponent message={String(error)} />
                </div>
            </>
        );
    }
}
