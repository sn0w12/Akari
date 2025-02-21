import { SmallManga } from "@/app/api/interfaces";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getMangaArrayFromSupabase } from "./supabase";
import axios from "axios";
import * as cheerio from "cheerio";
import db from "./db";
import { checkIfBookmarked } from "./bookmarks";
import { CookieJar } from "tough-cookie";
import { env } from "process";

export function getUserData(
    cookieStore: ReadonlyRequestCookies,
): string | null {
    const userAccCookie = cookieStore.get("user_acc")?.value || "{}";
    const userAcc = JSON.parse(userAccCookie);

    if (!userAcc) {
        return null;
    }

    return userAcc.user_data;
}

export async function replaceImages(manga: SmallManga[]) {
    const identifiers = manga.map((m) => m.id);
    const malDataArray = await getMangaArrayFromSupabase(identifiers);
    manga.forEach((m) => {
        const malData = malDataArray.find((data) => data?.identifier === m.id);
        if (malData?.imageUrl) {
            m.image = malData.imageUrl;
        }
    });
}

export async function processMangaList(url: string, page: string) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];
    const popular: SmallManga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $(".content-genres-item").each((index: number, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.img-loading").attr("src");
        const titleElement = mangaElement.find("h3 a.genres-item-name");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("a.genres-item-chap");
        const latestChapter =
            chapterElement
                .text()
                .replace("-", ".")
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0]
                .replace("Chapter ", "") || "";
        const chapterUrl = chapterElement.attr("href");
        const description = mangaElement
            .find(".genres-item-description")
            .text()
            .trim();
        const rating = mangaElement.find("em.genres-item-rate").text();
        const views = mangaElement.find(".genres-item-view").text();
        const date = mangaElement.find(".genres-item-time").text();
        const author = mangaElement.find(".genres-item-author").text();

        mangaList.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            description: description,
            rating: rating,
            views: views,
            date: date,
            author: author,
        });
    });

    const totalStories: number = mangaList.length;
    const lastPageElement = $("a.page-last");
    const totalPages: number = lastPageElement.length
        ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
        : 1;

    if (Number(page) > totalPages) {
        return new Response(JSON.stringify({ error: "Page not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    $(".item").each((index: number, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.img-loading").attr("src");
        const titleElement = mangaElement.find("h3 a.text-nowrap");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("a.text-nowrap");
        const latestChapter =
            chapterElement
                .text()
                .replace(title, "")
                .replace("-", ".")
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0]
                .replace("Chapter ", "") || "";
        const chapterUrl = chapterElement.attr("href");

        popular.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            description: "",
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            date: "",
            rating: "",
            views: "",
            author: "",
        });
    });

    await Promise.all([replaceImages(mangaList), replaceImages(popular)]);

    const result = {
        mangaList,
        popular,
        metaData: { totalStories, totalPages },
    };
    return result;
}

export async function getBookmarked(mangaList: SmallManga[]) {
    const promises = mangaList.map(async (manga) => {
        const cachedManga = await db.getCache(db.mangaCache, manga.id);
        if (!cachedManga) {
            return null;
        }
        return { id: cachedManga.id, identifier: manga.id };
    });

    const mangaIds = (await Promise.all(promises)).filter((id) => id !== null);
    if (mangaIds.length === 0) {
        return [];
    }

    // Create id->identifier mapping
    const idMap = new Map(mangaIds.map((item) => [item.id, item.identifier]));

    const bookmarkedIds = await checkIfBookmarked(
        mangaIds.map((item) => item.id),
    );

    // Transform using identifiers as keys
    const transformedBookmarks = Object.entries(bookmarkedIds).reduce<
        Record<string, boolean>
    >((acc, [id, value]) => {
        const identifier = idMap.get(id);
        if (identifier) {
            acc[identifier] = value;
        }
        return acc;
    }, {});

    const bookmarkedManga = Object.entries(transformedBookmarks)
        .filter(([_, value]) => value)
        .map(([identifier]) => identifier);

    return bookmarkedManga;
}

export async function addExtraCookies(jar: CookieJar) {
    const cookies = [
        {
            name: "__ddg3",
            value: env.NEXT_MANGANATO_DDG3 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddg2_",
            value: env.NEXT_MANGANATO_DDG2 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddgmark_",
            value: env.NEXT_MANGANATO_DDGMARK || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddg10_",
            value: env.NEXT_MANGANATO_DDG10 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddg1_",
            value: env.NEXT_MANGANATO_DDG1 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "content_server",
            value: env.NEXT_MANGANATO_CONTENT_SERVER || "",
            domain: "chapmanganato.to",
        },
        {
            name: "__ddg5_",
            value: env.NEXT_MANGANATO_DDG5 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddg8_",
            value: env.NEXT_MANGANATO_DDG8 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddg9_",
            value: env.NEXT_MANGANATO_DDG9 || "",
            domain: ".chapmanganato.to",
        },
        {
            name: "__ddgid_",
            value: env.NEXT_MANGANATO_DDGID || "",
            domain: ".chapmanganato.to",
        },
    ];

    for (const cookie of cookies) {
        await jar.setCookie(
            `${cookie.name}=${cookie.value}`,
            `https://${cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain}`,
        );
    }
}
