import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { MangaDetails, DetailsChapter } from "../../../interfaces";
import { getMangaFromSupabase } from "@/lib/supabase";
import { generateCacheHeaders } from "@/lib/cache";
import {
    time,
    timeEnd,
    performanceMetrics,
    clearPerformanceMetrics,
} from "@/lib/utils";
import { formatDate } from "@/lib/mangaNato";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    clearPerformanceMetrics();
    time("Total API Request");
    const params = await props.params;
    const id = params.id;

    try {
        const jar = new CookieJar();

        const fetchMangaDetails = async (
            baseUrl: string,
        ): Promise<MangaDetails> => {
            time("Fetch Html");
            const url = `${baseUrl}/manga/${id}`;

            const instance = axios.create({
                headers: {
                    "User-Agent":
                        req.headers.get("user-agent") || "Mozilla/5.0",
                    "Accept-Language":
                        req.headers.get("accept-language") || "en-US,en;q=0.9",
                },
            });

            // Then wrap with cookie support
            const wrappedInstance = wrapper(instance);
            wrappedInstance.defaults.jar = jar;

            const response = await wrappedInstance.get(url, {
                headers: {
                    "User-Agent":
                        req.headers.get("user-agent") || "Mozilla/5.0",
                    "Accept-Language":
                        req.headers.get("accept-language") || "en-US,en;q=0.9",
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
            const mangaDetails = {
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
            return mangaDetails;
        };

        const [mangaDetails, malData] = await Promise.all([
            fetchMangaDetails("https://nelomanga.com"),
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
                mangaDetails.malData.description.replace(
                    removeSourcePattern,
                    "",
                );
        }

        timeEnd("Total API Request");
        return new Response(
            JSON.stringify({
                data: mangaDetails,
                performance: performanceMetrics,
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...generateCacheHeaders(
                        mangaDetails.storyData ? 300 : 0,
                        10800,
                    ),
                },
            },
        );
    } catch (error) {
        timeEnd("Total API Request");
        console.error(
            "Error fetching manga details:",
            (error as Error).message,
        );

        let errorMessage =
            "An unexpected error occurred while fetching manga details";
        let statusCode = 500;

        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            console.error("Response headers:", error.response?.headers);

            switch (error.response?.status) {
                case 404:
                    errorMessage = "Manga not found";
                    statusCode = 404;
                    break;
                case 429:
                    errorMessage = "Too many requests, please try again later";
                    statusCode = 429;
                    break;
                case 403:
                    errorMessage =
                        "Access denied. Please check your credentials";
                    statusCode = 403;
                    break;
            }
        }

        return new Response(
            JSON.stringify({
                error: {
                    message: errorMessage,
                    details: (error as Error).message,
                    code: statusCode,
                },
            }),
            {
                status: statusCode,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
