export interface Manga {
    mangaId: string;
    identifier: string;
    storyData: string;
    imageUrl: string;
    name: string;
    authors: string[];
    status: string;
    updated: string;
    view: string;
    score: number;
    genres: string[];
    description: string;
    chapterList: {
        id: string;
        path: string;
        name: string;
        view: string;
        createdAt: string;
    }[];
}

export interface MangaDetails {
    mangaId: string | null;
    identifier: string;
    storyData: string | null;
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
    chapterList: DetailsChapter[];
    malData: HqMangaCacheItem | null;
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
    date: string | number;
    views: string;
}

export interface MangaCacheItem {
    name: string;
    link: string;
    image: string;
    last_chapter: string;
    last_read: string;
    last_update: string;
    bm_data: string;
    id: string;
}

export interface DetailsChapter {
    id: string;
    path: string;
    name: string;
    view: string;
    createdAt: string;
}

export interface HqMangaCacheItem {
    identifier: string;
    aniUrl: string;
    malUrl: string;
    description: string;
    imageUrl: string;
    smallImageUrl: string;
    score: number;
    titles: { type: string; title: string }[];
    url: string;
    is_strip: boolean | undefined;
    up_to_date: boolean | undefined;
    updated_at?: string | undefined;
    should_show_popup?: boolean;
}

export interface Bookmark {
    up_to_date: boolean | undefined;
    bm_data: string;
    chapter_namenow: string;
    chapter_numbernow: string;
    chapterlastdateupdate: string;
    chapterlastname: string;
    chapterlastnumber: string;
    image: string;
    isread: string;
    link_chapter_last: string;
    link_chapter_now: string;
    link_story: string;
    note_story_id: string;
    note_story_name: string;
    noteid: string;
    storyid: string;
    storyname: string;
    storynameunsigned_storykkl: string;
}

export interface MalSync {
    success: boolean;
    data: MalData;
}

export interface MalData {
    id: string;
    mal_id: number;
    image: string;
    description: string;
    score: number;
    created_at: string;
    updated_at: string;
    should_show_popup: boolean;
}

export interface ChapterImage {
    url: string;
    data?: string;
    mimeType?: string;
    width?: number;
    height?: number;
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
    images: ChapterImage[] | string[];
    mangaId: string | null;
    chapterId: string | null;
    token: string;
}

export interface SimpleError {
    result: string;
    data: string;
}

export interface NewManga {
    id: string;
    mangaId: string;
    storyData: string;
    imageUrl: string;
    titles: { [type: string]: string };
    authors: string[];
    genres: string[];
    status: string;
    views: string;
    score: number;
    description: string;
    chapters: NewChapter[];
    createdAt: string;
    updatedAt: string;
}

export interface NewChapter {
    id: string;
    storyData: string;
    chapterData: string;
    title: string;
    images: string[];
    pages: number;
    chapters: { id: string; title: string }[];
    nextChapter: string | null;
    previousChapter: string | null;
    parentId: string;
    parentTitle: string;
    views: string;
    createdAt: string;
    updatedAt: string;
}

export interface NeloMangaSearchResult {
    id: number;
    author: string;
    name: string;
    chapterLatest: string;
    url: string;
    thumb: string;
    slug: string;
}

export interface ReadingHistoryEntry {
    id: string;
    userId: string;
    mangaId: string;
    mangaIdentifier: string;
    mangaTitle: string;
    image: string;
    chapterId: string;
    chapterIdentifier: string;
    chapterTitle: string;
    readAt: Date;
}
