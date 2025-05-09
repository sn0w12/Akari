import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Bookmark } from "../../interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import { cookies } from "next/headers";
import { getMangaArrayFromSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const images = searchParams.get("images") === "true";
        const url = `https://${process.env.NEXT_MANGA_URL}/bookmark?page=${page}`;
        const cookieStore = await cookies();

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
            const storyName = $element.find(".bm-title a").text().trim();

            // Get chapter information
            const viewedChapterElement = $element.find(
                '.user-bookmark-item-right span:contains("Viewed")',
            );
            const currentChapterElement = $element.find(
                '.user-bookmark-item-right span:contains("Current")',
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
            console.log(currentChapterNumber, viewedChapterNumber);

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
                up_to_date:
                    Number(viewedChapterNumber) ===
                    Number(currentChapterNumber),
                bm_data: "", // This field might need to be populated from elsewhere
                chapter_namenow: viewedChapterText,
                chapter_numbernow: viewedChapterNumber,
                chapterlastdateupdate: lastUpdated,
                chapterlastname: currentChapterText,
                chapterlastnumber: currentChapterNumber,
                image: image,
                isread: "0", // Default value, might need to be determined differently
                link_chapter_last: currentChapterLink,
                link_chapter_now: viewedChapterLink,
                link_story: storyLink,
                note_story_id: bookmarkId,
                note_story_name: storyName,
                noteid: bookmarkId,
                storyid: bookmarkId,
                storyname: storyName,
                storynameunsigned_storykkl: storyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-"),
            };

            bookmarks.push(bookmark);
        });

        if (images) {
            // Extract identifiers from story links
            const identifiers = bookmarks.map(
                (bookmark) => bookmark.link_story.split("/").pop() || "",
            );

            // Get high quality images from Supabase
            const supabaseImages = await getMangaArrayFromSupabase(identifiers);

            // Update bookmark images if found
            bookmarks.forEach((bookmark) => {
                const identifier = bookmark.link_story.split("/").pop() || "";
                const supabaseImage = supabaseImages.find(
                    (img) => img.identifier === identifier,
                );
                if (supabaseImage?.imageUrl) {
                    bookmark.image = supabaseImage.imageUrl;
                }
            });
        }

        const response = new Response(
            JSON.stringify({ bookmarks, totalPages }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    ...generateCacheHeaders(120),
                },
            },
        );
        setCookieHeaders.forEach((cookie) => {
            response.headers.append("Set-Cookie", cookie);
        });

        return response;
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return NextResponse.redirect(new URL("/account", request.url), {
                    headers: {
                        "Cache-Control":
                            "no-store, no-cache, must-revalidate, proxy-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                        "Surrogate-Control": "no-store",
                    },
                });
            }

            return NextResponse.json(
                {
                    result: "error",
                    data: error.response?.data || error.message,
                },
                { status: error.response?.status || 500 },
            );
        }
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}
