export async function getSearchResults(query: string, n: number = 5) {
    const res = await fetch(
        `/api/search?search=${query.trim().replaceAll(" ", "_")}`,
    );
    const data = await res.json();
    const firstNResults = data.mangaList.slice(0, n);
    return firstNResults;
}
