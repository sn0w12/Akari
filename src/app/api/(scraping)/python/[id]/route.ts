import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { NewChapter, NewManga } from "../../../interfaces";
import { getMangaFromSupabase } from "@/lib/supabase";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const cookieStore = await cookies();
    const userAcc = cookieStore.get("user_acc")?.value || null;

    try {
        const jar = new CookieJar();

        const fetchMangaDetails = async (
            baseUrl: string,
        ): Promise<NewManga> => {
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
            const titles: { [type: string]: string } = {};
            titles["default"] = $(".story-info-right h1").text();
            const alternativeNames = $(
                ".variations-tableInfo .info-alternative",
            )
                .closest("tr")
                .find("td.table-value")
                .text()
                .trim()
                .split("; ");
            alternativeNames.forEach((name, index) => {
                titles[`alt${index}`] = name.trim();
            });
            const authors: string[] = [];
            $(".variations-tableInfo .info-author")
                .closest("tr")
                .find("a")
                .each((index, element) => {
                    authors.push($(element).text().trim());
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

            const view = $(".story-info-right-extent .info-view")
                .parent()
                .parent()
                .find(".stre-value")
                .text()
                .trim();

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

            const chapterList: {
                id: string;
                views: string;
                createdAt: string;
                updatedAt: string;
            }[] = [];
            const chapterTimes: string[] = [];
            $(".panel-story-chapter-list .row-content-chapter li").each(
                (index, element) => {
                    const chapterElement = $(element);
                    const chapterUrl = chapterElement
                        .find(".chapter-name")
                        .attr("href");
                    const chapterViews = chapterElement
                        .find(".chapter-view")
                        .text();
                    const chapterTime = chapterElement
                        .find(".chapter-time")
                        .attr("title");

                    if (!chapterTime) {
                        return;
                    }

                    const date = new Date(chapterTime);
                    const isoDate = date.toISOString();
                    chapterTimes.push(isoDate);

                    chapterList.push({
                        id: chapterUrl?.split("/").pop() || "",
                        views: chapterViews,
                        createdAt: isoDate,
                        updatedAt: isoDate,
                    });
                },
            );

            if (!imageUrl) {
                throw new Error("MANGA_NOT_FOUND");
            }

            const sortedTimes = [...chapterTimes].sort();
            const createdAt = sortedTimes[0] || "";
            const updatedAt = sortedTimes[sortedTimes.length - 1] || "";

            return {
                id: identifier,
                mangaId: mangaId || "",
                storyData: glbStoryData || "",
                imageUrl,
                titles,
                authors,
                status,
                views: view,
                score,
                genres,
                description,
                chapters: chapterList as NewChapter[],
                createdAt: createdAt,
                updatedAt: updatedAt,
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

        if (malData) {
            mangaDetails.imageUrl = malData.imageUrl;
            const removeSourcePattern = /\(Source:.*?\)\s*/gi;
            mangaDetails.description = mangaDetails.description.replace(
                removeSourcePattern,
                "",
            );

            if (malData.titles) {
                malData.titles.forEach(({ type, title }) => {
                    if (type.toLowerCase() === "default") {
                        return;
                    }

                    const titleType = type.toLowerCase();
                    Object.entries(mangaDetails.titles).forEach(
                        ([key, value]) => {
                            if (key === "default") {
                                return;
                            }
                            if (value === title) {
                                delete mangaDetails.titles[key];
                            }
                        },
                    );

                    mangaDetails.titles[titleType] = title;
                });
            }
        }

        return new Response(JSON.stringify(mangaDetails), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
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
