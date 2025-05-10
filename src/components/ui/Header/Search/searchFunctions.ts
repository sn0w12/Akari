import { SmallManga } from "@/app/api/interfaces";

export async function getSearchResults(query: string, n: number = 5) {
    const response = await fetch(
        `/api/search/simple?q=${encodeURIComponent(query)}`,
    );
    const data = await response.json();

    // Convert object to array and take first n results
    const results = (Object.values(data.mangaList) as SmallManga[])
        .slice(0, n)
        .map((item) => ({
            id: item.id,
            title: item.title,
            image: item.image,
        }));

    return results;
}
