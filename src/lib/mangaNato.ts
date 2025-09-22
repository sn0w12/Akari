import { SmallManga } from "@/app/api/interfaces";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getMangaArrayFromSupabase } from "./supabase";
import axios from "axios";
import * as cheerio from "cheerio";
import { time, timeEnd } from "@/lib/utils";

export function getUserData(
    cookieStore: ReadonlyRequestCookies,
): string | null {
    const userAccCookie = cookieStore.get("user_acc")?.value || "{}";
    const userAcc = JSON.parse(userAccCookie);

    if (!userAcc) {
        return null;
    }

    return userAcc.user_data;
}

export async function replaceImages(manga: SmallManga[]) {
    const identifiers = manga.map((m) => m.id);
    const malDataArray = await getMangaArrayFromSupabase(identifiers);
    manga.forEach((m) => {
        const malData = malDataArray.find((data) => data?.identifier === m.id);
        if (malData?.imageUrl) {
            m.image = malData.imageUrl;
        }
    });
}

export function formatDate(date: string) {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour12: true,
    });
    return formattedDate;
}

export async function processMangaListTest(url: string, page: string) {
    time("Fetch HTML");
    const { data } = await axios.get(url, {
        timeout: 10000,
    });
    timeEnd("Fetch HTML");

    time("Parse HTML");
    const $ = cheerio.load(data);

    const mangaList: SmallManga[] = [];
    const popular: SmallManga[] = [];

    // Loop through each .list-truyen-item-wrap div and extract the relevant information
    $(".list-comic-item-wrap").each((index: number, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img.lazy").attr("src");
        const titleElement = mangaElement.find("h3 a");
        const title = titleElement.text();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find(
            "a.list-story-item-wrap-chapter",
        );
        const latestChapter =
            chapterElement
                .text()
                .trim()
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0]
                .replace("Chapter ", "") || "";
        const chapterUrl = chapterElement.attr("href");
        const description = mangaElement.find("p").text().trim();
        const views = mangaElement.find(".aye_icon").text();

        mangaList.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            description: description,
            rating: "", // Site doesn't seem to have ratings
            views: views,
            date: "", // Site doesn't show dates
            author: "", // Author info needs to be extracted from description if needed
        });
    });
    timeEnd("Parse HTML");

    $(".owl-carousel .item").each((index: number, element) => {
        const mangaElement = $(element);
        const imageUrl = mangaElement.find("img").attr("src");
        const titleElement = mangaElement.find("h3 a");
        const title = titleElement.text().trim();
        const mangaUrl = titleElement.attr("href");
        const chapterElement = mangaElement.find(".slide-caption > a").last();
        const latestChapter =
            chapterElement
                .text()
                .trim()
                .match(/[Cc]hapter\s(\d+)(\.\d+)?/)?.[0]
                .replace("Chapter ", "") || "";
        const chapterUrl = chapterElement.attr("href");

        popular.push({
            id: mangaUrl?.split("/").pop() || "",
            image: imageUrl || "",
            title: title,
            chapter: latestChapter,
            chapterUrl: chapterUrl || "",
            description: "", // Popular section doesn't show descriptions
            rating: "",
            views: "",
            date: "",
            author: "",
        });
    });
    timeEnd("Parse Popular");

    // Replace manga images with high quality versions from Supabase
    const allManga = [...mangaList, ...popular];
    const identifiers = allManga.map((manga) => manga.id);
    const supabaseImages = await getMangaArrayFromSupabase(identifiers);

    // Update images if found in Supabase
    allManga.forEach((manga) => {
        const supabaseImage = supabaseImages.find(
            (img) => img.identifier === manga.id,
        );
        if (supabaseImage?.imageUrl) {
            manga.image = supabaseImage.imageUrl;
        }
    });

    const totalStories: number = mangaList.length;
    const lastPageElement = $("a.page_blue.page_last");
    const totalPages: number = lastPageElement.length
        ? parseInt(lastPageElement.text().match(/\d+/)?.[0] || "1", 10)
        : 1;

    if (Number(page) > totalPages) {
        return { error: "Page not found" };
    }

    const result = {
        mangaList,
        popular,
        metaData: { totalStories, totalPages },
    };
    return result;
}
