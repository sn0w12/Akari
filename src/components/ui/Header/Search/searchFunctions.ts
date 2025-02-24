import { NeloMangaSearchResult } from "@/app/api/interfaces";

export async function getSearchResults(query: string, n: number = 5) {
    const response = await fetch(
        `/api/search/simple?q=${encodeURIComponent(query)}`,
    );
    const data = await response.json();

    // Convert object to array and take first n results
    const results = (Object.values(data) as NeloMangaSearchResult[])
        .slice(0, n)
        .map((item) => ({
            id: item.slug,
            title: item.name,
            image: item.thumb,
        }));

    return results;
}
