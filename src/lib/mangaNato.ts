import {
    Chapter,
    DetailsChapter,
    MangaDetails,
    MangaListResponse,
    SimpleError,
    SmallManga,
} from "@/app/api/interfaces";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getMangaArrayFromSupabase, getMangaFromSupabase } from "./supabase";
import axios from "axios";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { generateCacheHeaders } from "./cache";
import { getGenreIds, parseDateString } from "./utils";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { badImages } from "./badImages";

export function getUserData(cookieStore: ReadonlyRequestCookies) {
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

export async function scrapeAuthorPage(
    authorId: string,
    orderBy: string,
    page: number,
): Promise<MangaListResponse | SimpleError> {
    if (!authorId) {
        return { result: "error", data: "No valid author included in search" };
    }

    // Construct the search URL
    const searchUrl = `https://manganato.com/author/story/${authorId}?page=${page}&orby=${orderBy}`;

    // Fetch the data from Manganato
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $(".search-story-item").each((index, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.img-loading").attr("src");
        const titleElement = mangaElement.find("h3 a.item-title");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("a.item-chapter").first();
        const latestChapter = chapterElement.text();
        const chapterUrl = chapterElement.attr("href");
        const rating = mangaElement.find("em.item-rate").text();
        const author = mangaElement.find(".item-author").text();

        let views: string | undefined;
        let date: string | undefined;

        mangaElement.find(".item-time").each((i, timeElement) => {
            if (i === 0) date = $(timeElement).text();
            if (i === 1) views = $(timeElement).text();
        });

        if (!date || !views) return;

        mangaList.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            rating: rating,
            author: author,
            date: parseDateString(date),
            views: views.replace("View : ", ""),
            description: "",
        });
    });

    if (orderBy === "latest") {
        mangaList.sort((a, b) => {
            return Number(b.date) - Number(a.date);
        });
    }

    const totalStories: number = mangaList.length;
    const lastPageElement = $("a.page-last");
    const totalPages: number = lastPageElement.length
        ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
        : 1;

    if (page > totalPages) {
        return { result: "error", data: "Page number exceeds total pages" };
    }

    await replaceImages(mangaList);

    const result = {
        mangaList,
        metaData: { totalStories, totalPages },
    };

    return result;
}

export async function scrapeMangaGenre(
    includeGenresParam: string[],
    excludeGenresParam: string[],
    orderBy: string,
    page: number,
): Promise<MangaListResponse | SimpleError> {
    // Convert genre names to their corresponding IDs
    const includeGenres = getGenreIds(includeGenresParam);
    const excludeGenres = getGenreIds(excludeGenresParam);

    if (includeGenres.length === 0) {
        return { result: "error", data: "No valid genres included in search" };
    }

    // Construct include and exclude genre strings
    const includeGenresString = includeGenres.map((id) => `_${id}_`).join("");
    const excludeGenresString = excludeGenres.map((id) => `_${id}_`).join("");

    // Construct the search URL
    const searchUrl = `https://manganato.com/advanced_search?s=all&g_i=${includeGenresString}&g_e=${excludeGenresString}&page=${page}&orby=${orderBy}`;

    // Fetch the data from Manganato
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $(".content-genres-item").each((index, element) => {
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
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || "";
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

    if (page > totalPages) {
        return { result: "error", data: "Page number exceeds total pages" };
    }

    await replaceImages(mangaList);

    const result = {
        mangaList,
        metaData: { totalStories, totalPages },
    };

    return result;
}

export async function scrapeMangaDetails(
    id: string,
): Promise<MangaDetails | SimpleError> {
    const cookieStore = await cookies();
    const userAcc = cookieStore.get("user_acc")?.value || null;

    const jar = new CookieJar();

    const fetchMangaDetails = async (
        baseUrl: string,
    ): Promise<MangaDetails> => {
        const url = `${baseUrl}/${id}`;

        if (userAcc) {
            await jar.setCookie(
                `user_acc=${userAcc}`,
                "https://chapmanganato.to",
            );
            await jar.setCookie(`user_acc=${userAcc}`, "https://manganato.com");
        }

        const instance = wrapper(axios.create({ jar }));
        const response = await instance.get(url);

        const html = response.data;
        const $ = cheerio.load(html);

        const identifier = url.split("/").pop() || "";
        const imageUrl = $(".story-info-left .info-image img").attr("src");
        const name = $(".story-info-right h1").text();
        const alternativeNames = $(".variations-tableInfo .info-alternative")
            .closest("tr")
            .find("td.table-value")
            .text()
            .trim()
            .split("; ");
        const authors: string[] = [];
        const author_urls: string[] = [];
        $(".variations-tableInfo .info-author")
            .closest("tr")
            .find("a")
            .each((index, element) => {
                authors.push($(element).text().trim());
                author_urls.push($(element).attr("href") || "");
            });
        const status = $(".variations-tableInfo .info-status")
            .closest("tr")
            .find("td.table-value")
            .text()
            .trim();
        const description = $(".panel-story-info-description")
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(
                `Come visit MangaNato.com sometime to read the latest chapter.`,
                "",
            )
            .trim();
        const score = parseFloat($('em[property="v:average"]').text().trim());

        const genres: string[] = [];
        $(".variations-tableInfo .info-genres")
            .closest("tr")
            .find("a")
            .each((index, element) => {
                genres.push($(element).text().trim());
            });

        const updated = $(".story-info-right-extent .info-time")
            .parent()
            .parent()
            .find(".stre-value")
            .text()
            .trim();
        const view = $(".story-info-right-extent .info-view")
            .parent()
            .parent()
            .find(".stre-value")
            .text()
            .trim();

        const chapterList: DetailsChapter[] = [];
        $(".panel-story-chapter-list .row-content-chapter li").each(
            (index, element) => {
                const chapterElement = $(element);
                const chapterName = chapterElement
                    .find(".chapter-name")
                    .text()
                    .trim();
                const chapterUrl = chapterElement
                    .find(".chapter-name")
                    .attr("href");
                const chapterView = chapterElement
                    .find(".chapter-view")
                    .text()
                    .trim();
                const chapterTime = chapterElement
                    .find(".chapter-time")
                    .attr("title");

                if (!chapterTime) {
                    return;
                }

                chapterList.push({
                    id: chapterUrl?.split("/").pop() || "",
                    path: chapterUrl || "",
                    name: chapterName,
                    view: chapterView,
                    createdAt: chapterTime,
                });
            },
        );

        const scriptTags = $(".body-site script");

        let glbStoryData: string | null = null;
        let mangaId: string | null = null;

        scriptTags.each((i, elem) => {
            const scriptContent = $(elem).html();

            if (scriptContent) {
                const storyDataMatch = scriptContent.match(
                    /glb_story_data\s*=\s*'([^']+)'/,
                );
                const postidMatches = scriptContent.matchAll(
                    /\$postid\s*=\s*('|")(\d+)('|")/gm,
                );
                const firstMatch = [...postidMatches][0];
                if (firstMatch) {
                    mangaId = firstMatch[2]; // Gets the group containing digits
                }
                if (storyDataMatch) {
                    glbStoryData = storyDataMatch[1];
                }
            }
        });

        if (!imageUrl) {
            throw new Error("MANGA_NOT_FOUND");
        }

        return {
            mangaId,
            identifier,
            storyData: glbStoryData,
            imageUrl,
            name,
            alternativeNames,
            authors,
            author_urls,
            status,
            updated,
            view,
            score,
            genres,
            description,
            chapterList,
            malData: null,
        };
    };

    const [mangaDetails, malData] = await Promise.all([
        fetchMangaDetails("https://chapmanganato.to"),
        getMangaFromSupabase(id),
    ]).catch((error) => {
        if (error.message === "MANGA_NOT_FOUND") {
            throw new Error("The specified manga could not be found");
        }
        throw error;
    });

    mangaDetails.malData = malData;
    if (mangaDetails.malData) {
        if (mangaDetails.malData.description == "") {
            mangaDetails.malData.description = mangaDetails.description;
        }
        const removeSourcePattern = /\(Source:.*?\)\s*/gi;
        mangaDetails.malData.description =
            mangaDetails.malData.description.replace(removeSourcePattern, "");
    }

    return mangaDetails;
}

export async function scrapeMangaChapter(
    id: string,
    subId: string,
): Promise<Chapter> {
    const cookieStore = await cookies();
    const userAcc = cookieStore.get("user_acc")?.value || null;
    const server = cookieStore.get(`manga_server`)?.value || "1";

    // Fetch the HTML content of the page
    const response = await axios.get(
        `https://chapmanganato.to/${id}/${subId}`,
        {
            headers: {
                cookie: `user_acc=${userAcc}; content_server=server${server}`,
            },
        },
    );
    const html = response.data;

    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(html);

    // Extract the title and chapter name from the panel-breadcrumb
    const breadcrumbLinks = $(".panel-breadcrumb a");
    const mangaTitle = $(breadcrumbLinks[1]).text();
    const parent = $(breadcrumbLinks[1]).attr("href")?.split("/").pop() || "";
    const chapterTitle = $(breadcrumbLinks[2]).text();
    const chapters: Chapter["chapters"] = [];
    const chapterSelect = $(".navi-change-chapter").first();
    chapterSelect.find("option").each((index, element) => {
        const chapterValue = $(element).attr("data-c");
        const chapterText = $(element).text();
        if (chapterValue) {
            chapters.push({ value: chapterValue, label: chapterText });
        }
    });

    // Extract all image URLs from the container-chapter-reader div
    const imageElements = $(".container-chapter-reader img");
    const images: string[] = [];
    imageElements.each((index, element) => {
        const imageUrl = $(element).attr("src");
        if (imageUrl) images.push(imageUrl);
    });

    const pages = images.length;

    const nextChapterLink = $(".navi-change-chapter-btn-next").attr("href");
    const nextChapter = nextChapterLink
        ? `${id}/${nextChapterLink.split("/").pop()}`
        : id;
    const lastChapterLink = $(".navi-change-chapter-btn-prev").attr("href");
    const lastChapter = lastChapterLink
        ? `${id}/${lastChapterLink.split("/").pop()}`
        : id;

    const scriptTags = $(".body-site script");

    let glbStoryData: string | null = null;
    let glbChapterData: string | null = null;

    // Loop through script tags to find the one containing glb_story_data
    scriptTags.each((i, elem) => {
        const scriptContent = $(elem).html();

        if (scriptContent && scriptContent.includes("glb_story_data")) {
            // Extract glb_story_data and glb_chapter_data using regex
            const storyDataMatch = scriptContent.match(
                /glb_story_data\s*=\s*'([^']+)'/,
            );
            const chapterDataMatch = scriptContent.match(
                /glb_chapter_data\s*=\s*'([^']+)'/,
            );

            if (storyDataMatch && storyDataMatch[1]) {
                glbStoryData = storyDataMatch[1];
            }
            if (chapterDataMatch && chapterDataMatch[1]) {
                glbChapterData = chapterDataMatch[1];
            }
        }
    });

    // Load and check first and last images
    if (images.length > 0) {
        try {
            const [firstImageResponse, lastImageResponse] = await Promise.all([
                axios.get(images[0], {
                    responseType: "arraybuffer",
                    headers: {
                        Referer: "https://manganato.com",
                        "User-Agent": "Mozilla/5.0",
                    },
                }),
                axios.get(images[images.length - 1], {
                    responseType: "arraybuffer",
                    headers: {
                        Referer: "https://manganato.com",
                        "User-Agent": "Mozilla/5.0",
                    },
                }),
            ]);

            const firstImageBase64 = Buffer.from(
                firstImageResponse.data,
            ).toString("base64");
            const lastImageBase64 = Buffer.from(
                lastImageResponse.data,
            ).toString("base64");

            if (badImages.includes(firstImageBase64)) {
                images.shift();
            }
            if (badImages.includes(lastImageBase64)) {
                images.pop();
            }
        } catch (error) {
            console.error("Error checking images:", error);
        }
    }

    // Return the response as JSON
    const responseData: Chapter = {
        title: mangaTitle,
        chapter: chapterTitle,
        chapters: chapters,
        pages: pages,
        parentId: parent,
        nextChapter: nextChapter,
        lastChapter: lastChapter,
        images: images,
        storyData: glbStoryData,
        chapterData: glbChapterData,
    };

    return responseData;
}

export async function scrapeMangaHome(
    page: number,
): Promise<MangaListResponse | SimpleError> {
    // Construct the URL with the page number
    const url = `https://manganato.com/genre-all/${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];
    const popular: SmallManga[] = [];

    // Loop through each .content-genres-item div and extract the relevant information
    $(".content-genres-item").each((index, element) => {
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
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || "";
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

    if (page > totalPages) {
        return { result: "error", data: "Page number exceeds total pages" };
    }

    $(".item").each((index, element) => {
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
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0] || "";
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
