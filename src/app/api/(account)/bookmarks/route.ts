import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Bookmark } from "@/app/api/interfaces";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { getMangaArrayFromSupabase } from "@/lib/supabase";
import { generateClientCacheHeaders } from "@/lib/cache";
import { time, timeEnd } from "@/lib/utils";

const BOOKMARK_SERVER_URL_1 = "https://user.mngusr.com/bookmark_get_list_full";

function pluralizeTimeAgo(input: string): string {
    const trimmedInput = input.trim();
    const hourPattern = /^(\d+) hour ago$/;
    const dayPattern = /^(\d+) day ago$/;

    const hourMatch = trimmedInput.match(hourPattern);
    const dayMatch = trimmedInput.match(dayPattern);

    if (hourMatch) {
        const num = parseInt(hourMatch[1], 10);
        return num === 1 ? trimmedInput : `${num} hours ago`;
    }

    if (dayMatch) {
        const num = parseInt(dayMatch[1], 10);
        return num === 1 ? trimmedInput : `${num} days ago`;
    }

    return trimmedInput;
}

async function fetchData(
    user_data: string,
    page: number,
    url: string,
    out_type: string,
) {
    const data = new URLSearchParams();
    data.append("user_data", user_data);
    data.append("bm_page", page.toString());
    data.append("bm_source", "manganato");
    data.append("out_type", out_type);

    const response = await fetch(url, {
        method: "POST",
        body: data.toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    return out_type === "json" ? response.json() : response.text();
}

async function fetchBookmarks(user_data: string, page: number, url: string) {
    try {
        const [jsonResponse, htmlResponse] = await Promise.all([
            fetchData(user_data, page, url, "json"),
            fetchData(user_data, page, url, "html"),
        ]);
        return { jsonResponse, htmlResponse };
    } catch (error) {
        throw new Error(
            `Error fetching bookmarks: ${(error as Error).message}`,
        );
    }
}

function extractBmData(
    onClickAttr: string,
    noteId: string,
): string | undefined {
    const match = onClickAttr.match(/fun_bookmark_delete\('([^']+)'/);
    if (match && match[1]) {
        return match[1];
    } else {
        console.log(`Could not extract bm_data for noteid ${noteId}`);
        return undefined;
    }
}

function processBookmarks(
    jsonResult: { result: string; data: Bookmark[] },
    htmlResult: string,
) {
    const html = JSON.parse(htmlResult);
    const $ = cheerio.load(html.data);

    for (const item of jsonResult.data) {
        const noteId = item.noteid;
        const className = `bm-it-${noteId}`;
        item.chapterlastdateupdate = pluralizeTimeAgo(
            item.chapterlastdateupdate,
        );

        const element = $(`.${className}`);
        if (!element.length) {
            console.log(`Element not found for noteid ${noteId}`);
            continue;
        }

        const removeButton = element.find(".btn-remove");
        if (!removeButton.length) {
            console.log(`Remove button not found for noteid ${noteId}`);
            continue;
        }

        const onClickAttr = removeButton.attr("onclick");
        if (!onClickAttr) {
            console.log(`No onclick attribute found for noteid ${noteId}`);
            continue;
        }

        const bmData = extractBmData(onClickAttr, noteId);
        if (bmData) {
            item["bm_data"] = bmData;
        }
    }
}

export async function GET(request: Request) {
    time("bookmarks-api");
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const getImages = searchParams.get("images") === "true";

    const cookieStore = await cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        timeEnd("bookmarks-api");
        return NextResponse.json(
            { message: "user_data is required" },
            { status: 400 },
        );
    }

    try {
        const url = BOOKMARK_SERVER_URL_1;
        time("fetch-bookmarks");
        const { jsonResponse: jsonResult, htmlResponse: htmlResult } =
            await fetchBookmarks(user_data, page, url);
        timeEnd("fetch-bookmarks");

        if (jsonResult.result !== "ok") {
            timeEnd("bookmarks-api");
            return NextResponse.json(
                {
                    message: "Error fetching bookmarks",
                    details: jsonResult.data,
                },
                { status: 500 },
            );
        }

        processBookmarks(jsonResult, htmlResult);
        if (getImages) {
            time("fetch-images");
            const identifiers = jsonResult.data.map((bookmark: Bookmark) =>
                bookmark.link_story.split("/").pop(),
            );

            const imageData = await getMangaArrayFromSupabase(identifiers);
            const imageMap = new Map(
                imageData.map((item) => [item.identifier, item.imageUrl]),
            );

            jsonResult.data.forEach((bookmark: Bookmark) => {
                const identifier = bookmark.link_story.split("/").pop();
                const imageUrl = imageMap.get(identifier);
                if (imageUrl) {
                    bookmark.image = imageUrl;
                }
            });
            timeEnd("fetch-images");
        }

        timeEnd("bookmarks-api");
        return NextResponse.json(
            {
                page,
                totalPages: jsonResult.bm_page_total,
                bookmarks: jsonResult.data,
            },
            {
                status: 200,
                headers: {
                    ...generateClientCacheHeaders(30),
                },
            },
        );
    } catch (error) {
        timeEnd("bookmarks-api");
        return NextResponse.json(
            {
                message: "Error fetching bookmarks",
                error: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
