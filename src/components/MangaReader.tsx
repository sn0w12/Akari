import { Chapter, SimpleError } from "@/app/api/interfaces";
import Reader from "./ui/MangaReader/reader";
import { headers } from "next/headers";
import { getProductionUrl } from "@/app/api/baseUrl";
import ErrorComponent from "./ui/error";

interface ChapterReaderProps {
    id: string;
    subId: string;
}

export async function fetchChapter(id: string, subId: string) {
    let headersList: { [key: string]: string } = {};
    try {
        const headerEntries = Array.from((await headers()).entries());
        headersList = headerEntries.reduce(
            (acc: { [key: string]: string }, [key, value]) => {
                acc[key] = value;
                return acc;
            },
            {} as { [key: string]: string },
        );
    } catch (headerError) {
        console.log("Could not get headers:", headerError);
    }

    const response = await fetch(
        `${getProductionUrl()}/api/manga/${id}/${subId}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...headersList,
            },
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
    let chapterData: Chapter | SimpleError = {} as Chapter;
    let errorMessage = "";
    try {
        chapterData = await fetchChapter(id, subId);
    } catch (error) {
        errorMessage = String(error);
    }

    if ("result" in chapterData) {
        return <ErrorComponent message={chapterData.data} />;
    }
    if (errorMessage) {
        return <ErrorComponent message={errorMessage} />;
    }

    return <Reader chapter={chapterData} />;
}
