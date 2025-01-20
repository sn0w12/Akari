import { advancedSearch } from "@/lib/search";

export async function getSearchResults(query: string, n: number = 5) {
    const data = await advancedSearch(query);
    const firstNResults = data.mangaList.slice(0, n);
    return firstNResults;
}
