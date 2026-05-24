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
            error?.data.message || "Failed to fetch search results",
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

export const MANGA_TYPES = ["Manga", "Manhwa", "Manhua"] as const;

export const genreSeverityRank: Record<string, number> = {
    adult: 2,
    hentai: 2,
    mature: 2,
    shoujo_ai: 2,
    shounen_ai: 2,
    smut: 2,
    ecchi: 1,
};

const genreSortOrder = new Map<string, { category: number; index: number }>();

Object.values(GENRE_CATEGORIES).forEach((categoryGenres, categoryIndex) => {
    categoryGenres.forEach((genre, index) => {
        genreSortOrder.set(genre, { category: categoryIndex, index });
    });
});

export function sortGenresByCategory(genres: readonly string[]): string[] {
    return [...genres].sort((left, right) => {
        const leftSeverity =
            genreSeverityRank[left.toLowerCase().replaceAll(" ", "_")] ?? 0;
        const rightSeverity =
            genreSeverityRank[right.toLowerCase().replaceAll(" ", "_")] ?? 0;

        if (leftSeverity !== rightSeverity) {
            return leftSeverity - rightSeverity;
        }

        const leftOrder = genreSortOrder.get(left) ?? {
            category: Number.POSITIVE_INFINITY,
            index: Number.POSITIVE_INFINITY,
        };
        const rightOrder = genreSortOrder.get(right) ?? {
            category: Number.POSITIVE_INFINITY,
            index: Number.POSITIVE_INFINITY,
        };

        if (leftOrder.category !== rightOrder.category) {
            return leftOrder.category - rightOrder.category;
        }

        if (leftOrder.index !== rightOrder.index) {
            return leftOrder.index - rightOrder.index;
        }

        return left.localeCompare(right);
    });
}
