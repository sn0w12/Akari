import axios from "axios";
import { CookieJar } from "tough-cookie";
import { HttpCookieAgent, HttpsCookieAgent } from "http-cookie-agent/http";
import * as cheerio from "cheerio";

interface UserData {
    user_version: string;
    user_name: string | null;
    user_image: string;
    user_data: string | null;
}

interface Chapter {
    id: string;
    path: string;
    name: string;
    view: string;
    createdAt: string | undefined;
}

interface MangaDetails {
    mangaId: string | null;
    identifier: string;
    storyData: string | null;
    imageUrl: string | undefined;
    name: string;
    authors: string[];
    author_urls: string[];
    status: string;
    updated: string;
    view: string;
    score: number;
    genres: string[];
    description: string;
    chapterList: Chapter[];
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
): Promise<Response> {
    const id = params.id;
    const { searchParams } = new URL(req.url);
    const userData: UserData = {
        user_version: "2.3",
        user_name: searchParams.get("user_name"),
        user_image: "https://user.manganelo.com/avt.png",
        user_data: searchParams.get("user_data"),
    };
    console.log(JSON.stringify(userData));

    try {
        const jar = new CookieJar();

        const fetchMangaDetails = async (
            baseUrl: string,
        ): Promise<MangaDetails> => {
            const url = `${baseUrl}/${id}`;

            if (userData.user_name && userData.user_data) {
                jar.setCookieSync(`user_acc=${JSON.stringify(userData)}`, url);
            }

            const instance = axios.create({
                httpAgent: new HttpCookieAgent({ cookies: { jar } }),
                httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
            });

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

            const chapterList: Chapter[] = [];
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
                    const postidMatch = scriptContent.match(
                        /\$postid\s*=\s*'(\d+)'/,
                    );

                    if (postidMatch) {
                        mangaId = postidMatch[1];
                    }
                    if (storyDataMatch) {
                        glbStoryData = storyDataMatch[1];
                    }
                }
            });

            return {
                mangaId,
                identifier,
                storyData: glbStoryData,
                imageUrl,
                name,
                authors,
                author_urls,
                status,
                updated,
                view,
                score,
                genres,
                description,
                chapterList,
            };
        };

        let mangaDetails = await fetchMangaDetails("https://chapmanganato.to");
        const oldMangaDetails = mangaDetails;

        if (!mangaDetails.storyData) {
            console.log(
                "glbStoryData not found on chapmanganato.to, retrying with manganato.com",
            );
            mangaDetails = await fetchMangaDetails("https://manganato.com");
        }

        const hasMoreInfo = (
            oldDetails: MangaDetails,
            newDetails: MangaDetails,
        ) => {
            for (const key in oldDetails) {
                if (
                    oldDetails[key as keyof MangaDetails] &&
                    !newDetails[key as keyof MangaDetails]
                ) {
                    return true;
                }
            }
            return false;
        };

        if (hasMoreInfo(oldMangaDetails, mangaDetails)) {
            mangaDetails = oldMangaDetails;
        }

        return new Response(JSON.stringify(mangaDetails), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(
            "Error fetching manga details:",
            (error as Error).message,
        );
        if (axios.isAxiosError(error) && error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        }
        return new Response(
            JSON.stringify({ error: "Failed to fetch manga details" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
