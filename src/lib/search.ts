export const genreMap: { [key: string]: number } = {
    Action: 2,
    Adventure: 4,
    Comedy: 6,
    Cooking: 7,
    Doujinshi: 9,
    Drama: 10,
    Erotica: 48,
    Fantasy: 12,
    "Gender bender": 13,
    Harem: 14,
    Historical: 15,
    Horror: 16,
    Isekai: 45,
    Josei: 17,
    Manhua: 44,
    Manhwa: 43,
    "Martial arts": 19,
    Mature: 20,
    Mecha: 21,
    Medical: 22,
    Mystery: 24,
    "One shot": 25,
    Pornographic: 47,
    Psychological: 26,
    Romance: 27,
    "School life": 28,
    "Sci fi": 29,
    Seinen: 30,
    Shoujo: 31,
    "Shoujo ai": 32,
    Shounen: 33,
    "Shounen ai": 34,
    "Slice of life": 35,
    Smut: 36,
    Sports: 37,
    Supernatural: 38,
    Tragedy: 39,
    Webtoons: 40,
    Yaoi: 41,
    Yuri: 42,
};

export const GENRE_CATEGORIES: Record<string, readonly string[]> = {
    Demographics: ["Shounen", "Shoujo", "Seinen", "Josei"],
    Format: ["Manga", "Manhwa", "Manhua", "One shot", "Webtoons", "Doujinshi"],
    Themes: [
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Romance",
        "Sci fi",
        "Slice of life",
    ],
    Content: ["Mature", "Smut", "Erotica", "Yaoi", "Yuri"],
    Other: [
        "Sports",
        "Martial arts",
        "Supernatural",
        "Horror",
        "Mystery",
        "Psychological",
        "Tragedy",
    ],
};

export async function advancedSearch(
    query: string,
    includedGenres: string[] = [],
    excludedGenres: string[] = [],
    page: number = 1,
) {
    const baseUrl = `/api/search?query=${query.trim().replaceAll(" ", "_")}`;
    const includedParams =
        includedGenres.length > 0
            ? `&included=${includedGenres.join(",")}`
            : "";
    const excludedParams =
        excludedGenres.length > 0
            ? `&excluded=${excludedGenres.join(",")}`
            : "";
    const pageParam = `&page=${page}`;

    const url = `${baseUrl}${includedParams}${excludedParams}${pageParam}`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
}