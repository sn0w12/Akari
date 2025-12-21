import { client } from ".";

export async function getSearchResults(query: string, n: number = 5) {
    const { data, error } = await client.GET("/v2/manga/search", {
        params: {
            query: {
                query: query,
                limit: n,
            },
        },
    });

    if (error || !data.data) {
        throw new Error(
            error?.data.message || "Failed to fetch search results"
        );
    }

    return data.data;
}

export const genres = [
    "Action",
    "Adult",
    "Adventure",
    "Comedy",
    "Doujinshi",
    "Drama",
    "Ecchi",
    "Fantasy",
    "Gender Bender",
    "Harem",
    "Hentai",
    "Historical",
    "Horror",
    "Isekai",
    "Josei",
    "Lolicon",
    "Martial Arts",
    "Mature",
    "Mecha",
    "Mystery",
    "Other",
    "Psychological",
    "Romance",
    "School Life",
    "Sci-fi",
    "Seinen",
    "Shotacon",
    "Shoujo",
    "Shoujo Ai",
    "Shounen",
    "Shounen Ai",
    "Slice of Life",
    "Smut",
    "Sports",
    "Supernatural",
    "Thriller",
    "Tragedy",
    "Yaoi",
    "Yuri",
] as const;
export type Genre = (typeof genres)[number];

export const GENRE_CATEGORIES: Record<string, readonly Genre[]> = {
    Demographics: ["Josei", "Seinen", "Shoujo", "Shounen"],
    Genres: [
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Isekai",
        "Romance",
        "Slice of Life",
        "Sports",
        "Thriller",
    ],
    Themes: [
        "Doujinshi",
        "Ecchi",
        "Gender Bender",
        "Harem",
        "Historical",
        "Horror",
        "Martial Arts",
        "Mecha",
        "Mystery",
        "Other",
        "Psychological",
        "School Life",
        "Sci-fi",
        "Supernatural",
        "Tragedy",
        "Yaoi",
        "Yuri",
    ],
    Mature: ["Adult", "Hentai", "Mature", "Shoujo Ai", "Shounen Ai", "Smut"],
};
