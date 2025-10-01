export interface Manga {
    mangaId: string | null;
    identifier: string;
    imageUrl: string;
    name: string;
    alternativeNames: string[];
    authors: string[];
    status: string;
    updated: string;
    view: string;
    score: number;
    genres: string[];
    description: string;
    chapterList: MangaChapter[];
    malData: MalData | null;
}

export interface MangaChapter {
    id: string;
    path: string;
    name: string;
    view: string;
    createdAt: string;
}

export interface SmallManga {
    id: string;
    image: string;
    title: string;
    description: string;
    chapter: string;
    chapterUrl: string;
    rating: string;
    author: string;
    date: number;
    views: string;
}

export interface Chapter {
    id: string;
    title: string;
    chapter: string;
    chapters: { value: string; label: string }[];
    pages: number;
    parentId: string;
    nextChapter: string;
    lastChapter: string;
    images: string[];
    mangaId: string | null;
    chapterId: string | null;
    type: MangaType | null;
    malId: number | null;
    malImage: string | null;
}

export interface ChapterImage {
    url: string;
    data?: string;
    width?: number;
    height?: number;
}

export interface Bookmark {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    mangaUrl: string;
    currentChapter: {
        name: string;
        number: number;
        url: string;
    };
    latestChapter: {
        name: string;
        number: number;
        url: string;
        lastUpdated: string;
    };
    isUpToDate: boolean;
}

export interface SmallBookmark {
    mangaId: string;
    mangaName: string;
    mangaImage: string | null;
    latestChapter: string;
}

export interface SmallBookmarkRecord extends SmallBookmark {
    last_read_at: string;
    created_at: string;
    updated_at: string;
}

export interface MalData {
    id: string;
    created_at: string;
    updated_at: string;
    image: string;
    description: string | null;
    score: number | null;
    mal_id: number;
    ani_id: number | null;
    type: MangaType;
}

type MangaType = "Manga" | "Manhwa" | "Manhua";
