import { processMangaList, formatDate } from "./manganato";
import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { setupCache } from "axios-cache-interceptor";
import { Manga, MangaChapter, Chapter, SmallManga } from "@/types/manga";
import {
    getMangaArrayFromSupabase,
    getMangaFromSupabase,
} from "@/lib/api/supabase/manga";
import {
    time,
    timeEnd,
    clearPerformanceMetrics,
    cleanText,
} from "@/lib/api/performance";
import { cacheLife } from "next/cache";
import { ApiErrorData } from "@/lib/api";

export async function getLatestManga(page: string) {
    "use cache";
    cacheLife("minutes");

    try {
        const url = `https://${process.env.NEXT_MANGA_URL}/manga-list/latest-manga?page=${page}&type=newest`;
        const result = await processMangaList(url, page);

        return result;
    } catch (error) {
        console.error(error);
        return { message: "Failed to load manga data" } as ApiErrorData;
    }
}

export async function getPopularManga(page: string) {
    "use cache";

    try {
        const url = `https://${process.env.NEXT_MANGA_URL}/manga-list/hot-manga?page=${page}`;
        const result = await processMangaList(url, page);

        return result;
    } catch (error) {
        console.error(error);
        return { message: "Failed to load popular manga data" } as ApiErrorData;
    }
}

export async function fetchMangaDetails(
    id: string,
    userAgent?: string,
    acceptLanguage?: string
): Promise<Manga | ApiErrorData> {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Manga Fetch");

    try {
        const jar = new CookieJar();
        const baseUrl = `https://${process.env.NEXT_MANGA_URL}`;

        const fetchDetails = async (): Promise<Manga> => {
            time("Fetch Html");
            const url = `${baseUrl}/manga/${id}`;

            const instance = axios.create({
                headers: {
                    "User-Agent": userAgent || "Mozilla/5.0",
                    "Accept-Language": acceptLanguage || "en-US,en;q=0.9",
                },
            });

            // Then wrap with cookie support
            const wrappedInstance = wrapper(instance);
            setupCache(wrappedInstance);
            wrappedInstance.defaults.jar = jar;

            const response = await wrappedInstance.get(url, {
                headers: {
                    "User-Agent": userAgent || "Mozilla/5.0",
                    "Accept-Language": acceptLanguage || "en-US,en;q=0.9",
                },
                timeout: 10000,
            });
            timeEnd("Fetch Html");

            time("Parse Html");
            const html = response.data;
            const $ = cheerio.load(html);
            timeEnd("Parse Html");

            time("Extract Data");
            const identifier = url.split("/").pop() || "";
            const imageUrl = $(".manga-info-top .manga-info-pic img").attr(
                "src"
            );
            const name = $(".manga-info-text h1").text();
            const alternativeNamesText = $(".story-alternative").text().trim();
            const alternativeNames = alternativeNamesText
                .replace("Alternative :", "")
                .split(";")
                .flatMap((altName) => altName.split("/"))
                .map((altName) => altName.trim())
                .filter(
                    (altName) =>
                        altName && altName.toLowerCase() !== name.toLowerCase()
                );
            const authors: string[] = [];
            $(".manga-info-text li").each((_, element) => {
                const text = $(element).text().trim();
                if (text.startsWith("Author")) {
                    const authorNames = text.split(":")[1];
                    authorNames.split("/").forEach((author) => {
                        const trimmedAuthor = author.trim();
                        if (trimmedAuthor) {
                            authors.push(trimmedAuthor);
                        }
                    });
                }
            });
            let status = $(".manga-info-text li")
                .filter((_, element) =>
                    $(element).text().trim().startsWith("Status")
                )
                .text()
                .replace("Status :", "")
                .trim();
            if (status.toLowerCase() === "releasing") {
                status = "Ongoing";
            }
            const description = $("#contentBox")
                .clone()
                .children("h2")
                .remove()
                .end()
                .text()
                .trim();
            const rateRowText = $("#rate_row_cmd").text().trim();
            const scoreMatch = rateRowText.match(/rate\s*:\s*(\d+(\.\d+)?)/i);
            let score = 0;
            if (scoreMatch && scoreMatch[1]) {
                score = parseFloat(scoreMatch[1]);
            }

            const genres: string[] = [];
            $(".manga-info-text li.genres a").each((_, element) => {
                genres.push($(element).text().trim());
            });

            const updated = formatDate(
                $(".manga-info-text li")
                    .filter((_, element) =>
                        $(element).text().trim().startsWith("Last updated")
                    )
                    .text()
                    .replace("Last updated :", "")
                    .trim()
            );
            const view = $(".manga-info-text li")
                .filter((_, element) =>
                    $(element).text().trim().startsWith("View")
                )
                .text()
                .replace("View :", "")
                .trim();

            const chapterList: MangaChapter[] = [];
            $(".chapter-list .row").each((index, element) => {
                const chapterElement = $(element);
                const chapterLink = chapterElement.find("span:first-child a");
                const chapterName = chapterLink.text().trim();
                const chapterUrl = chapterLink.attr("href");
                const chapterView = chapterElement
                    .find("span:nth-child(2)")
                    .text()
                    .trim();
                const chapterTime = formatDate(
                    chapterElement.find("span:last-child").attr("title") || ""
                );

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
            });

            const scriptTags = $("script");

            let mangaId: string | null = null;

            scriptTags.each((i, elem) => {
                const scriptContent = $(elem).html();

                if (scriptContent) {
                    // Update postid extraction to match direct variable assignment
                    const postidMatch =
                        scriptContent.match(/\$postid\s*=\s*(\d+)/);
                    if (postidMatch) {
                        mangaId = postidMatch[1];
                    }
                }
            });

            if (!imageUrl) {
                throw new Error("MANGA_NOT_FOUND");
            }

            timeEnd("Extract Data");
            return {
                mangaId,
                identifier,
                imageUrl,
                name,
                alternativeNames,
                authors,
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
            fetchDetails(),
            getMangaFromSupabase(id),
        ]).catch((error) => {
            if (error.message === "MANGA_NOT_FOUND") {
                throw new Error("The specified manga could not be found");
            }
            throw error;
        });

        mangaDetails.malData = malData;
        if (mangaDetails.malData) {
            if (mangaDetails.malData.description === null) {
                mangaDetails.malData.description = mangaDetails.description;
            }
            const removeSourcePattern = /\(Source:.*?\)\s*/gi;
            mangaDetails.malData.description = (
                mangaDetails.malData.description ?? ""
            ).replace(removeSourcePattern, "");
        }

        timeEnd("Total Manga Fetch");
        return mangaDetails;
    } catch (error) {
        timeEnd("Total Manga Fetch");
        console.error(
            "Error fetching manga details:",
            (error as Error).message
        );

        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch manga data",
        };
    }
}

export async function fetchChapterData(
    id: string,
    subId: string
): Promise<Chapter | ApiErrorData> {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Chapter Fetch");

    const jar = new CookieJar();

    try {
        const fetchChapterDetails = async (): Promise<Chapter> => {
            time("Fetch HTML");
            const instance = axios.create({
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });

            const wrappedInstance = wrapper(instance);
            setupCache(wrappedInstance);
            wrappedInstance.defaults.jar = jar;

            // Fetch the HTML content of the page
            const response = await wrappedInstance.get(
                `https://${process.env.NEXT_MANGA_URL}/manga/${id}/${subId}`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Accept-Language": "en-US,en;q=0.9",
                    },
                    timeout: 10000,
                }
            );
            const html = response.data;
            timeEnd("Fetch HTML");

            time("Parse HTML");
            // Load the HTML into cheerio for parsing
            const $ = cheerio.load(html);
            timeEnd("Parse HTML");

            time("Extract Data");
            // Extract the title and chapter name from the panel-breadcrumb
            const breadcrumbLinks = $(".breadcrumb a");
            const mangaTitle = $(breadcrumbLinks[1]).text();
            const parent =
                $(breadcrumbLinks[1]).attr("href")?.split("/").pop() || "";
            const chapterTitle = $(breadcrumbLinks[2]).text();
            const chapters: Chapter["chapters"] = [];
            const chapterSelect = $(".navi-change-chapter").first();
            chapterSelect.find("option").each((index, element) => {
                const chapterValue = $(element).attr("data-c");
                const chapterText = $(element).text();
                if (chapterValue) {
                    chapters.push({
                        value:
                            chapterValue
                                .split("/")
                                .pop()
                                ?.replace("chapter-", "")
                                ?.replace("-", ".") || "",
                        label: cleanText(chapterText),
                    });
                }
            });

            // Extract all image URLs from the container-chapter-reader div
            const imageElements = $(".container-chapter-reader img");
            const imageUrls: string[] = [];
            imageElements.each((index, element) => {
                const imageUrl = $(element).attr("src");
                if (imageUrl && !imageUrl.includes(".gif"))
                    imageUrls.push(imageUrl);
            });

            const pages = imageUrls.length;

            const nextChapterLink = $(".back").attr("href");
            const nextChapter = nextChapterLink
                ? `${id}/${nextChapterLink.split("/").pop()}`
                : id;
            const lastChapterLink = $(".next").attr("href");
            const lastChapter = lastChapterLink
                ? `${id}/${lastChapterLink.split("/").pop()}`
                : id;

            const scriptTags = $("script");

            let mangaId: string | null = null;
            let chapterId: string | null = null;

            // Loop through script tags to find the one containing glb_story_data
            scriptTags.each((i, elem) => {
                const scriptContent = $(elem).html();

                if (scriptContent) {
                    // Extract glb_story_data and glb_chapter_data using regex
                    if (scriptContent.includes("window.chapter_data")) {
                        const comicIdMatch = scriptContent.match(
                            /"comic_id":\s*"(\d+)"/
                        );
                        const chapterIdMatch = scriptContent.match(
                            /"chapter_id":\s*"(\d+)"/
                        );

                        if (comicIdMatch && comicIdMatch[1]) {
                            mangaId = comicIdMatch[1];
                        }
                        if (chapterIdMatch && chapterIdMatch[1]) {
                            chapterId = chapterIdMatch[1];
                        }
                    }
                }
            });

            const responseData: Chapter = {
                id: subId,
                title: cleanText(mangaTitle),
                chapter: cleanText(chapterTitle),
                number: subId.replace("chapter-", "").replace("-", "."),
                chapters: chapters,
                pages: pages,
                parentId: parent,
                nextChapter: nextChapter,
                lastChapter: lastChapter,
                images: imageUrls,
                mangaId: mangaId,
                chapterId: chapterId,
                type: null,
                malId: null,
                malImage: null,
            };
            timeEnd("Extract Data");

            // Process unique chapters after extraction
            const uniqueChapters: Chapter["chapters"] = Array.from(
                new Map<string, Chapter["chapters"][0]>(
                    responseData.chapters.map((item) => [item.value, item])
                ).values()
            );
            responseData.chapters = uniqueChapters;

            return responseData;
        };

        const [chapterData, malData] = await Promise.all([
            fetchChapterDetails(),
            getMangaFromSupabase(id),
        ]);

        chapterData.type = malData?.type || null;
        chapterData.malId = malData?.mal_id || null;
        chapterData.malImage = malData?.image || null;

        timeEnd("Total Chapter Fetch");
        return chapterData;
    } catch (error: unknown) {
        timeEnd("Total Chapter Fetch");
        console.error("Error fetching chapter data:", error);

        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch chapter data",
        };
    }
}

export async function fetchGenreData(
    genre: string,
    page: string = "1",
    orderBy: string = "latest"
) {
    "use cache";
    cacheLife("minutes");

    if (!genre) {
        return {
            message: "No valid genre included in search",
        } as ApiErrorData;
    }

    try {
        // Construct the search URL
        const searchUrl = `https://${
            process.env.NEXT_MANGA_URL
        }/genre/${genre.toLowerCase()}?page=${page}&orby=${orderBy}`;
        const result = await processMangaList(searchUrl, page);

        return result;
    } catch (error) {
        console.error("Error fetching genre data:", error);
        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch genre data",
        };
    }
}

function parseSearchHtml(
    html: string,
    orderBy: string
): {
    mangaList: SmallManga[];
    totalStories: number;
    totalPages: number;
} {
    time("Parse HTML");
    const $ = cheerio.load(html);
    const mangaList: SmallManga[] = [];

    // Loop through each .story_item div and extract the relevant information
    $(".story_item").each((index, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img").attr("src");
        const titleElement = mangaElement.find("h3.story_name a");
        const title = titleElement.text().trim();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find("em.story_chapter a").first();
        const latestChapter = chapterElement.text().trim();
        const chapterUrl = chapterElement.attr("href");

        let author = "";
        let date = "";
        let views = "";

        mangaElement.find(".story_item_right span").each((i, span) => {
            const text = $(span).text().trim();
            if (text.startsWith("Author")) {
                author = text.replace("Author(s) : ", "");
            } else if (text.startsWith("Updated")) {
                date = text.replace("Updated : ", "");
            } else if (text.startsWith("View")) {
                views = text.replace("View : ", "");
            }
        });

        mangaList.push({
            id: mangaUrl?.split("/manga/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            rating: "N/A", // Rating is not present in the new HTML
            author: author,
            date: parseDateString(date),
            views: views,
            description: "",
        });
    });
    timeEnd("Parse HTML");

    time("Process Results");
    if (orderBy === "latest") {
        mangaList.sort((a, b) => {
            return Number(b.date) - Number(a.date);
        });
    }
    timeEnd("Process Results");

    const totalStories: number = mangaList.length;
    const lastPageElement = $("a.page_last");
    const totalPages: number = lastPageElement.length
        ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
        : 1;

    return {
        mangaList,
        totalStories: totalStories,
        totalPages: totalPages,
    };
}

export async function fetchAuthorData(
    authorId: string,
    page: string = "1",
    orderBy: string = "latest"
) {
    "use cache";
    cacheLife("days");

    clearPerformanceMetrics();
    time("Total Author Fetch");

    if (!authorId) {
        timeEnd("Total Author Fetch");
        return {
            message: "No valid author included in search",
        } as ApiErrorData;
    }

    try {
        // Construct the search URL
        const searchUrl = `https://${process.env.NEXT_MANGA_URL}/author/${authorId}?page=${page}&orby=${orderBy}`;

        time("Fetch HTML");
        const cachedAxios = setupCache(
            axios.create({
                timeout: 10000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                },
            })
        );
        // Fetch the data from Manganato
        const { data } = await cachedAxios.get(searchUrl);
        timeEnd("Fetch HTML");

        const { mangaList, totalStories, totalPages } = parseSearchHtml(
            data,
            orderBy
        );

        if (Number(page) > totalPages) {
            timeEnd("Total Author Fetch");
            return {
                message: "Page number exceeds total pages",
            } as ApiErrorData;
        }

        time("Fetch MAL Data");
        const malDataArray = await getMangaArrayFromSupabase(
            mangaList.map((m) => m.id)
        );
        mangaList.forEach((manga) => {
            const malData = malDataArray.find(
                (data) => data.identifier === manga.id
            );
            manga.image = malData?.imageUrl || manga.image;
        });
        timeEnd("Fetch MAL Data");

        const result = {
            mangaList,
            metaData: { totalStories, totalPages },
        };
        timeEnd("Total Author Fetch");

        return result;
    } catch (error) {
        timeEnd("Total Author Fetch");
        console.error("Error fetching author data:", error);
        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch author data",
        } as ApiErrorData;
    }
}

export async function fetchSearchData(
    searchTerm: string,
    page: string = "1",
    orderBy: string = "latest"
) {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Search Fetch");

    const searchUrl = `https://${process.env.NEXT_MANGA_URL}/search/story/${searchTerm}?page=${page}&orby=${orderBy}`;
    try {
        time("Fetch HTML");
        const cachedAxios = setupCache(
            axios.create({
                timeout: 10000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                },
            })
        );
        // Fetch the data from Manganato
        const { data } = await cachedAxios.get(searchUrl);
        timeEnd("Fetch HTML");

        const { mangaList, totalStories, totalPages } = parseSearchHtml(
            data,
            orderBy
        );

        if (Number(page) > totalPages) {
            timeEnd("Total Author Fetch");
            return {
                message: "Page number exceeds total pages",
            } as ApiErrorData;
        }

        const result = {
            mangaList,
            metaData: { totalStories, totalPages },
        };
        timeEnd("Total Search Fetch");

        return result;
    } catch (error) {
        timeEnd("Total Search Fetch");
        console.error("Error fetching search data:", error);
        return {
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch search data",
        } as ApiErrorData;
    }
}

// Helper function needed by fetchAuthorData
function parseDateString(dateStr: string | undefined): number {
    if (!dateStr) return 0;

    // Handle "Feb-23-2025 06:18" format
    const [datePart, timePart] = dateStr.split(" ");
    const [month, day, year] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");

    const date = new Date(
        parseInt(year),
        getMonthNumber(month),
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
    );
    return date.getTime();
}

function getMonthNumber(month: string): number {
    const months: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };
    return months[month] || 0;
}
