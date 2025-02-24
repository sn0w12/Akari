import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { Bookmark } from "../../interfaces";
import { generateCacheHeaders } from "@/lib/cache";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const url = `https://www.nelomanga.com/bookmark?page=${page}`;
        const cookieStore = await cookies();

        const { data } = await axios.get(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: cookieStore.toString(),
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                referer: `https://www.nelomanga.com/`,
                host: "www.nelomanga.com",
                origin: "https://www.nelomanga.com",
                accept: "application/json, text/javascript, */*; q=0.01",
                "x-requested-with": "XMLHttpRequest",
            },
        });
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

            // Extract chapter numbers
            const viewedChapterNumber =
                viewedChapterText.match(/Chapter (\d+)/)?.[1] || "";
            const currentChapterNumber =
                currentChapterText.match(/Chapter (\d+)/)?.[1] || "";

            // Get last update time
            const lastUpdated = $element
                .find(".chapter-datecreate")
                .text()
                .replace("Last updated :", "")
                .trim();

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

        return new Response(JSON.stringify({ bookmarks, totalPages }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...generateCacheHeaders(600),
            },
        });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        if (axios.isAxiosError(error)) {
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
