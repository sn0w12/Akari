import { HeaderComponent } from "@/components/Header";
import { Reader } from "./ui/MangaReader/reader";
import ErrorComponent from "./ui/error";
import { getUserHeaders } from "@/lib/serverUtils";
import { fetchChapterData } from "@/lib/scraping";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export default async function ChapterReader({ id, subId }: ChapterReaderProps) {
    try {
        const headersList = await getUserHeaders();
        const mangaServer = headersList.cookie
            .split(";")
            .find((cookie) => cookie.trim().startsWith("manga_server="))
            ?.split("=")[1];
        const chapterData = await fetchChapterData(id, subId, mangaServer);

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
