import { processMangaListTest } from "./mangaNato";
import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import {
    MangaDetails,
    DetailsChapter,
    Chapter,
    SimpleError,
    SmallManga,
    ChapterImage,
} from "@/app/api/interfaces";
import { getMangaFromSupabase } from "@/lib/supabase";
import { formatDate } from "@/lib/mangaNato";
import { time, timeEnd, clearPerformanceMetrics, cleanText } from "@/lib/utils";
import { unstable_cacheLife as cacheLife } from "next/cache";
import probe from "probe-image-size";

export async function getLatestManga(page: string) {
    "use cache";
    cacheLife("minutes");

    try {
        const url = `https://${process.env.NEXT_MANGA_URL}/manga-list/latest-manga?page=${page}&type=newest`;
        const result = await processMangaListTest(url, page);

        return result;
    } catch (error) {
        console.error(error);
        return { error: "Failed to load manga data" };
    }
}

export async function getPopularManga(page: string) {
    "use cache";

    try {
        const url = `https://${process.env.NEXT_MANGA_URL}/manga-list/hot-manga?page=${page}`;
        const result = await processMangaListTest(url, page);

        return result;
    } catch (error) {
        console.error(error);
        return { error: "Failed to load popular manga data" };
    }
}

export async function fetchMangaDetails(
    id: string,
    userAgent?: string,
    acceptLanguage?: string,
): Promise<MangaDetails | { error: { message: string } }> {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Manga Fetch");

    try {
        const jar = new CookieJar();
        const baseUrl = "https://nelomanga.com";

        const fetchDetails = async (): Promise<MangaDetails> => {
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
                "src",
            );
            const name = $(".manga-info-text h1").text();
            const alternativeNames = [""];
            const authors: string[] = [];
            $(".manga-info-text li").each((_, element) => {
                const text = $(element).text().trim();
                if (text.startsWith("Author")) {
                    $(element)
                        .find("a")
                        .each((_, authorElement) => {
                            authors.push($(authorElement).text().trim());
                        });
                }
            });
            const status = $(".manga-info-text li")
                .filter((_, element) =>
                    $(element).text().trim().startsWith("Status"),
                )
                .text()
                .replace("Status :", "")
                .trim();
            const description = $("#contentBox")
                .clone()
                .children("h2")
                .remove()
                .end()
                .text()
                .trim();
            const score = parseFloat(
                $(".rate_row .get_rate").attr("default-stars") || "0",
            );

            const genres: string[] = [];
            $(".manga-info-text li.genres a").each((_, element) => {
                genres.push($(element).text().trim());
            });

            const updated = formatDate(
                $(".manga-info-text li")
                    .filter((_, element) =>
                        $(element).text().trim().startsWith("Last updated"),
                    )
                    .text()
                    .replace("Last updated :", "")
                    .trim(),
            );
            const view = $(".manga-info-text li")
                .filter((_, element) =>
                    $(element).text().trim().startsWith("View"),
                )
                .text()
                .replace("View :", "")
                .trim();

            const chapterList: DetailsChapter[] = [];
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
                    chapterElement.find("span:last-child").attr("title") || "",
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

            let glbStoryData: string | null = null;
            let mangaId: string | null = null;

            scriptTags.each((i, elem) => {
                const scriptContent = $(elem).html();

                if (scriptContent) {
                    // Extract story data if present
                    const storyDataMatch = scriptContent.match(
                        /glb_story_data\s*=\s*'([^']+)'/,
                    );
                    if (storyDataMatch) {
                        glbStoryData = storyDataMatch[1];
                    }

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
                storyData: glbStoryData,
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
            if (mangaDetails.malData.description === "") {
                mangaDetails.malData.description = mangaDetails.description;
            }
            const removeSourcePattern = /\(Source:.*?\)\s*/gi;
            mangaDetails.malData.description =
                mangaDetails.malData.description.replace(
                    removeSourcePattern,
                    "",
                );
        }

        timeEnd("Total Manga Fetch");
        return mangaDetails;
    } catch (error) {
        timeEnd("Total Manga Fetch");
        console.error(
            "Error fetching manga details:",
            (error as Error).message,
        );

        return {
            error: {
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch manga data",
            },
        };
    }
}

export async function fetchChapterData(
    id: string,
    subId: string,
    mangaServer: string = "1",
): Promise<Chapter | SimpleError> {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Chapter Fetch");

    const jar = new CookieJar();

    try {
        time("Fetch HTML");
        const instance = axios.create({
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept-Language": "en-US,en;q=0.9",
                Referer: "https://ddos-guard.net",
            },
        });

        const wrappedInstance = wrapper(instance);
        wrappedInstance.defaults.jar = jar;

        // Fetch the HTML content of the page
        const response = await wrappedInstance.get(
            `https://nelomanga.com/manga/${id}/${subId}`,
            {
                headers: {
                    cookie: `content_server=server${mangaServer}`,
                    "User-Agent": "Mozilla/5.0",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                timeout: 10000,
            },
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
            if (imageUrl) imageUrls.push(imageUrl);
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

        const imageContainer = $(".container-chapter-reader");
        const token = imageContainer.find('input[name="_token"]').attr("value");

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
                        /"comic_id":\s*"(\d+)"/,
                    );
                    const chapterIdMatch = scriptContent.match(
                        /"chapter_id":\s*"(\d+)"/,
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

        let images: ChapterImage[] = [];
        time("Download Images");
        images = await Promise.all(
            imageUrls.map(async (url): Promise<ChapterImage> => {
                try {
                    const imageResponse = await wrappedInstance.get(url, {
                        responseType: "arraybuffer",
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
                            Accept: "image/avif,image/jxl,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
                            "Accept-Language": "en-US,en;q=0.5",
                            "Accept-Encoding": "gzip, deflate, br, zstd",
                            "Sec-GPC": "1",
                            Connection: "keep-alive",
                            Referer: `https://${process.env.NEXT_MANGA_URL}/`,
                            "Sec-Fetch-Dest": "image",
                            "Sec-Fetch-Mode": "no-cors",
                            "Sec-Fetch-Site": "cross-site",
                        },
                        timeout: 10000,
                    });

                    const mimeType =
                        imageResponse.headers["content-type"] || "image/jpeg";
                    const imageBuffer = Buffer.from(
                        imageResponse.data,
                        "binary",
                    );
                    const base64Data = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

                    // Extract image dimensions using sharp or image-size
                    let width: number | undefined;
                    let height: number | undefined;

                    try {
                        const dimensions = probe.sync(imageBuffer);
                        if (dimensions) {
                            width = dimensions.width;
                            height = dimensions.height;
                        }
                    } catch (dimensionError) {
                        console.error(
                            `Failed to extract image dimensions: ${url}`,
                            dimensionError,
                        );
                    }

                    return {
                        url,
                        data: base64Data,
                        mimeType,
                        width,
                        height,
                    };
                } catch (error) {
                    console.error(`Failed to download image: ${url}`, error);
                    return { url }; // Return just the URL if download fails
                }
            }),
        );
        timeEnd("Download Images");

        const responseData: Chapter = {
            id: subId,
            title: cleanText(mangaTitle),
            chapter: cleanText(chapterTitle),
            chapters: chapters,
            pages: pages,
            parentId: parent,
            nextChapter: nextChapter,
            lastChapter: lastChapter,
            images: images,
            mangaId: mangaId,
            chapterId: chapterId,
            token: token || "",
        };
        timeEnd("Extract Data");
        timeEnd("Total Chapter Fetch");

        // Process unique chapters after extraction
        const uniqueChapters: Chapter["chapters"] = Array.from(
            new Map<string, Chapter["chapters"][0]>(
                responseData.chapters.map((item) => [item.value, item]),
            ).values(),
        );
        responseData.chapters = uniqueChapters;

        return responseData;
    } catch (error: unknown) {
        timeEnd("Total Chapter Fetch");
        console.error("Error fetching chapter data:", error);

        return {
            result: "error",
            data:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch chapter data",
        };
    }
}

export async function fetchGenreData(
    genre: string,
    page: string = "1",
    orderBy: string = "latest",
) {
    "use cache";
    cacheLife("minutes");

    if (!genre) {
        return {
            result: "error",
            data: "No valid genre included in search",
        } as SimpleError;
    }

    try {
        // Construct the search URL
        const searchUrl = `https://nelomanga.com/genre/${genre.toLowerCase()}?page=${page}&orby=${orderBy}`;
        const result = await processMangaListTest(searchUrl, page);

        return result;
    } catch (error) {
        console.error("Error fetching genre data:", error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch genre data",
        };
    }
}

export async function fetchAuthorData(
    authorId: string,
    page: string = "1",
    orderBy: string = "latest",
) {
    "use cache";
    cacheLife("minutes");

    clearPerformanceMetrics();
    time("Total Author Fetch");

    if (!authorId) {
        timeEnd("Total Author Fetch");
        return {
            result: "error",
            data: "No valid author included in search",
        } as SimpleError;
    }

    try {
        // Construct the search URL
        const searchUrl = `https://mangakakalot.gg/author/${authorId}?page=${page}&orby=${orderBy}`;

        time("Fetch HTML");
        // Fetch the data from Manganato
        const { data } = await axios.get(searchUrl, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                referer: `https://www.mangakakalot.gg/`,
                host: "www.mangakakalot.gg",
            },
        });
        timeEnd("Fetch HTML");

        time("Parse HTML");
        const $ = cheerio.load(data);
        const mangaList: SmallManga[] = [];

        // Loop through each .story_item div and extract the relevant information
        $(".story_item").each((index, element) => {
            const mangaElement = $(element);
            const imageUrl = mangaElement.find("img").attr("src");
            const titleElement = mangaElement.find("h3.story_name a");
            const title = titleElement.text().trim();
            const mangaUrl = titleElement.attr("href");
            const chapterElement = mangaElement
                .find("em.story_chapter a")
                .first();
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
        const lastPageElement = $("a.page-last");
        const totalPages: number = lastPageElement.length
            ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
            : 1;

        if (Number(page) > totalPages) {
            timeEnd("Total Author Fetch");
            return {
                result: "error",
                data: "Page number exceeds total pages",
            } as SimpleError;
        }

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
            result: "error",
            data:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch author data",
        } as SimpleError;
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
        parseInt(minutes),
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
