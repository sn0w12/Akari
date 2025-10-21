import axios from "axios";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { getMangaArrayFromSupabase } from "@/lib/api/supabase/manga";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";
import { Bookmark } from "@/types/manga";
import { extractErrorFromAxios } from "@/lib/api/axios";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const images = searchParams.get("images") === "true";
        const url = `https://${process.env.NEXT_MANGA_URL}/bookmark?page=${page}`;
        const cookieStore = await cookies();

        const username = getUsernameFromCookies(cookieStore);
        if (!username) {
            return createApiErrorResponse(
                { message: "User not logged in" },
                { status: 401 }
            );
        }

        const { data, headers } = await axios.get(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: cookieStore.toString(),
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                referer: `https://${process.env.NEXT_MANGA_URL}`,
                host: process.env.NEXT_MANGA_URL,
                origin: process.env.NEXT_MANGA_URL,
                accept: "application/json, text/javascript, */*; q=0.01",
                "x-requested-with": "XMLHttpRequest",
            },
        });
        const setCookieHeaders = headers["set-cookie"] || [];
        const $ = cheerio.load(data);
        const bookmarks: Bookmark[] = [];

        const lastPageElement = $("a.go-p-end.a-hov");
        const totalPages: number = lastPageElement.length
            ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
            : 1;

        $(".user-bookmark-item").each((_, element) => {
            const $element = $(element);

            // Extract the story ID from the div class
            const bookmarkId =
                $element.attr("class")?.match(/bm-it-(\d+)/)?.[1] || "";

            // Get main story link and image
            const mainLink = $element.find("a").first();
            const storyLink = mainLink.attr("href") || "";
            const image = mainLink.find("img").attr("src") || "";

            // Get story name
            const title = $element.find(".bm-title a");
            const storyName = title.text().trim();
            const slug = title.attr("href")?.split("/").pop() || "";

            // Get chapter information
            const viewedChapterElement = $element.find(
                '.user-bookmark-item-right span:contains("Viewed")'
            );
            const currentChapterElement = $element.find(
                '.user-bookmark-item-right span:contains("Current")'
            );

            const viewedChapterLink =
                viewedChapterElement.find("a").attr("href") || "";
            const viewedChapterText = viewedChapterElement
                .find("a")
                .text()
                .trim();
            const currentChapterLink =
                currentChapterElement.find("a").attr("href") || "";
            const currentChapterText = currentChapterElement
                .find("a")
                .text()
                .trim();

            const viewedChapterNumber =
                viewedChapterText.match(/Chapter (\d+(?:\.\d+)?)/)?.[1] || "";
            const currentChapterNumber =
                currentChapterText.match(/Chapter (\d+(?:\.\d+)?)/)?.[1] || "";

            // Get last update time
            const rawLastUpdated = $element
                .find(".chapter-datecreate")
                .text()
                .replace("Last updated :", "")
                .trim();

            // Format the last updated time
            let lastUpdated = rawLastUpdated;
            if (rawLastUpdated.includes("-")) {
                // Handle date format "03-02 14:47"
                const [datePart] = rawLastUpdated.split(" "); // Take only the date part
                const [month, day] = datePart.split("-");
                const date = new Date();
                date.setMonth(parseInt(month) - 1);
                date.setDate(parseInt(day));
                lastUpdated = date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                });
            } else if (rawLastUpdated.includes("hour")) {
                // Handle "n hour ago" format
                const hours = parseInt(rawLastUpdated);
                lastUpdated = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
            } else if (rawLastUpdated.includes("day")) {
                // Handle "n day ago" format
                const days = parseInt(rawLastUpdated);
                lastUpdated = `${days} day${days !== 1 ? "s" : ""} ago`;
            }

            const bookmark: Bookmark = {
                id: bookmarkId,
                title: storyName,
                slug: slug,
                coverImage: image,
                mangaUrl: storyLink,
                currentChapter: {
                    name: viewedChapterText,
                    number: Number(viewedChapterNumber) || 0,
                    url: viewedChapterLink,
                },
                latestChapter: {
                    name: currentChapterText,
                    number: Number(currentChapterNumber) || 0,
                    url: currentChapterLink,
                    lastUpdated: lastUpdated,
                },
                isUpToDate:
                    Number(viewedChapterNumber) ===
                    Number(currentChapterNumber),
            };

            bookmarks.push(bookmark);
        });

        if (images) {
            // Extract identifiers from manga links
            const identifiers = bookmarks.map(
                (bookmark) => bookmark.mangaUrl.split("/").pop() || ""
            );

            // Get high quality images from Supabase
            const supabaseImages = await getMangaArrayFromSupabase(identifiers);

            // Update bookmark images if found
            bookmarks.forEach((bookmark) => {
                const identifier = bookmark.mangaUrl.split("/").pop() || "";
                const supabaseImage = supabaseImages.find(
                    (img) => img.identifier === identifier
                );
                if (supabaseImage?.imageUrl) {
                    bookmark.coverImage = supabaseImage.imageUrl;
                }
            });
        }

        return createApiResponse(
            { bookmarks, totalPages },
            {
                cacheTime: "5 minutes",
                isPrivate: true,
                setCookies: setCookieHeaders,
            }
        );
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        if (axios.isAxiosError(error)) {
            const errorData = extractErrorFromAxios(error);
            return createApiErrorResponse(errorData, {
                status: error.response?.status || 500,
            });
        }
        return createApiErrorResponse(
            { message: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}
