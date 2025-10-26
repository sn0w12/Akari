import { HeaderComponent } from "@/components/header";
import { Reader } from "./manga-reader/reader";
import ErrorComponent from "./error-page";
import { fetchChapterData } from "@/lib/manga/scraping";
import { cacheLife } from "next/cache";
import { isApiErrorData } from "@/lib/api";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export default async function ChapterReader({ id, subId }: ChapterReaderProps) {
    "use cache";
    cacheLife("days");

    const chapterData = await fetchChapterData(id, subId);

    if (isApiErrorData(chapterData)) {
        return (
            <>
                <HeaderComponent />
                <div className="p-8">
                    <ErrorComponent message={chapterData.message} />
                </div>
            </>
        );
    }

    return <Reader chapter={chapterData} />;
}
