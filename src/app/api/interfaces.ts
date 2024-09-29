export interface Manga {
    mangaId: string;
    storyData: string;
    imageUrl: string;
    name: string;
    authors: string[];
    status: string;
    updated: string;
    view: string;
    genres: string[];
    description: string;
    chapterList: {
      id: string;
      path: string;
      name: string;
      view: string;
      createdAt: string;
    }[]
}

export interface Chapter {
    title: string;
    chapter: string;
    pages: number;
    parentId: string;
    nextChapter: string;
    lastChapter: string;
    images: string[];
    storyData: string;
    chapterData: string;
}