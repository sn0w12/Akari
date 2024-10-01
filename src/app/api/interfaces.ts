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
    }[]
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