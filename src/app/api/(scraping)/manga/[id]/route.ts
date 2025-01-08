import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import NodeCache from "node-cache";
import { MangaDetails, DetailsChapter } from "../../../interfaces";
import { getMangaFromSupabase } from "@/lib/supabase";
import { generateCacheHeaders } from "@/lib/cache";

const cache = new NodeCache({ stdTTL: 10 * 60 }); // 10 minutes

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const cookieStore = await cookies();
    const userAcc = cookieStore.get("user_acc")?.value || null;
    const cacheKey = `mangaDetails_${id}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(300),
            },
        });
    }

    try {
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
                await jar.setCookie(
                    `user_acc=${userAcc}`,
                    "https://manganato.com",
                );
            }

            const instance = wrapper(axios.create({ jar }));
            const response = await instance.get(url, {
                headers: {
                    "User-Agent":
                        req.headers.get("user-agent") || "Mozilla/5.0",
                    "Accept-Language":
                        req.headers.get("accept-language") || "en-US,en;q=0.9",
                },
            });

            const html = response.data;
            const $ = cheerio.load(html);

            const identifier = url.split("/").pop() || "";
            const imageUrl = $(".story-info-left .info-image img").attr("src");
            const name = $(".story-info-right h1").text();
            const alternativeNames = $(
                ".variations-tableInfo .info-alternative",
            )
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
            const score = parseFloat(
                $('em[property="v:average"]').text().trim(),
            );

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
                mangaDetails.malData.description.replace(
                    removeSourcePattern,
                    "",
                );
        }
        if (mangaDetails.storyData) {
            cache.set(cacheKey, mangaDetails);
        }

        return new Response(JSON.stringify(mangaDetails), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(300),
            },
        });
    } catch (error) {
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
