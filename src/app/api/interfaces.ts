export interface Manga {
    mangaId: string;
    identifier: string;
    storyData: string;
    imageUrl: string;
    name: string;
    authors: string[];
    author_urls: string[];
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
    author_urls: string[];
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
    identifier: string;
    image: string;
    malId: number;
    aniId: number;
    page: string;
    title: string;
    type: string;
    url: string;
    malUrl: string;
    aniUrl: string;
}

export interface Chapter {
    title: string;
    chapter: string;
    chapters: { value: string; label: string }[];
    pages: number;
    parentId: string;
    nextChapter: string;
    lastChapter: string;
    images: string[];
    storyData: string | null;
    chapterData: string | null;
}

export interface SimpleError {
    result: string;
    data: string;
}
