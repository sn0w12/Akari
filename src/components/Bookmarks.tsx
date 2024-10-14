"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import Fuse from "fuse.js";
import React from "react";
import PaginationElement from "@/components/ui/paginationElement";
import { X } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirmDialog";
import Image from "next/image";
import { debounce } from "lodash";
import db from "@/lib/db";
import { getHqImage } from "@/lib/utils";
import { Bookmark, MangaCacheItem } from "@/app/api/interfaces";
import DesktopBookmarkCard from "./ui/Bookmarks/DesktopBookmarkCard";
import MobileBookmarkCard from "./ui/Bookmarks/MobileBookmarkCard";
import Toast from "@/lib/toastWrapper";
import { numberArraysEqual } from "@/lib/utils";
import { fetchMalData, syncMal } from "@/lib/malSync";

const fuseOptions = {
    keys: ["name"], // The fields to search in your data
    includeScore: false, // Optional: include the score in the results
    threshold: 0.4, // Adjust the fuzziness (0.0 = exact match, 1.0 = match all)
};

export default function BookmarksPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [allBookmarks, setAllBookmarks] = useState<MangaCacheItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MangaCacheItem[]>([]);
    const [workerFinished, setWorkerFinished] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const batchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messageQueue = useRef<Bookmark[]>([]);

    useEffect(() => {
        document.title = "Bookmarks";
    }, []);

    // Fetch bookmarks function
    const fetchBookmarks = async (page: number) => {
        setIsLoading(true);
        const user_data = localStorage.getItem("accountInfo"); // Get user data from localStorage
        if (!user_data) {
            setError("No user data found. Please log in.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `/api/bookmarks?page=${page}&user_data=${encodeURIComponent(user_data)}`,
            );
            if (!response.ok) {
                throw new Error("Failed to fetch bookmarks.");
            }
            const data = await response.json();

            const updateBookmarks = async (bookmarks: Bookmark[]) => {
                await Promise.all(
                    bookmarks.map(async (bookmark: Bookmark) => {
                        const id = bookmark.link_story?.split("/").pop() || "";

                        // Fetch high-quality image
                        bookmark.image = await getHqImage(id, bookmark.image);

                        // Check cache and update 'up_to_date' field if needed
                        if (id) {
                            const hqBookmark = await db.getCache(
                                db.hqMangaCache,
                                id,
                            );
                            if (hqBookmark) {
                                bookmark.up_to_date = hqBookmark.up_to_date;
                            }
                        }
                    }),
                );

                return bookmarks;
            };

            data.bookmarks = await updateBookmarks(data.bookmarks);
            setBookmarks(data.bookmarks);
            initWorker(data.bookmarks, data.page);
            setCurrentPage(data.page);
            setTotalPages(Number(data.totalPages));
            setError(null); // Clear any previous errors
        } catch (err) {
            setError((err as Error).message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const debounceFetchBookmarks = useCallback(
        debounce(fetchBookmarks, 10),
        [],
    );

    async function removeBookmark(bm_data: string, noteid: string) {
        const user_data = localStorage.getItem("accountInfo");

        if (!user_data) {
            console.error("User data not found");
            return;
        }

        const response = await fetch("/api/bookmarks/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_data: user_data,
                bm_data: bm_data,
            }),
        });
        const data = await response.json();
        console.log(data);

        if (data.result === "ok") {
            // Update the bookmarks state to remove the deleted bookmark
            setBookmarks((prevBookmarks) =>
                prevBookmarks.filter((bookmark) => bookmark.noteid !== noteid),
            );
        }
    }

    // Fetch bookmarks on component mount and whenever the page changes
    useEffect(() => {
        const page = Number(searchParams.get("page")) || 1;
        debounceFetchBookmarks(page);
    }, [searchParams]);

    async function updateBookmark(bookmark: Bookmark) {
        const cacheObject = {
            name: bookmark.note_story_name,
            link: bookmark.link_story,
            last_chapter: bookmark.link_chapter_last.split("/").pop(),
            last_read: bookmark.link_chapter_now.split("/").pop(),
            bm_data: bookmark.bm_data,
            id: bookmark.storyid,
            image: bookmark.image,
            last_update: bookmark.chapterlastdateupdate,
        };
        const storyId = bookmark.link_story.split("/").pop();
        if (storyId) {
            db.updateCache(db.mangaCache, storyId, cacheObject);

            const cacheEntry = await db.getCache(db.hqMangaCache, storyId);
            if (!cacheEntry || cacheEntry.up_to_date === undefined) {
                await db.updateCache(db.hqMangaCache, storyId, {
                    up_to_date:
                        bookmark.link_chapter_last == bookmark.link_chapter_now,
                });
            }
        }
    }

    const processBatch = () => {
        if (messageQueue.current.length > 0) {
            messageQueue.current.forEach((bookmark) => {
                updateBookmark(bookmark);
            });
            // Clear the queue
            messageQueue.current = [];
        }
    };

    const initWorker = async (bookmarkFirstPage: Bookmark[], page: number) => {
        if (page !== 1) {
            const bookmarkCache = (await db.getAllCacheValues(
                db.mangaCache,
            )) as MangaCacheItem[];
            setAllBookmarks(bookmarkCache);
            setWorkerFinished(true);
            return;
        }

        const cachedFirstPage = (await db.getCache(
            db.bookmarkCache,
            "firstPage",
        )) as Bookmark[];

        // Check if the first page of bookmarks has changed
        if (
            cachedFirstPage &&
            cachedFirstPage.length > 0 &&
            bookmarkFirstPage.length > 0
        ) {
            const firstPageIds = bookmarkFirstPage.map((bookmark) =>
                Number(bookmark.storyid),
            );
            const cacheIds = cachedFirstPage.map((bookmark) =>
                Number(bookmark.storyid),
            );

            let matchFound = false;
            const len = firstPageIds.length;
            // Loop through the bookmarks and try matching smaller and smaller slices of the cache
            for (let i = 0; i < len; i++) {
                for (let j = len; j > 0; j--) {
                    if (j < 3) {
                        // Skip comparisons if the length of the slice is less than the minimum length
                        continue;
                    }
                    const bookmarkSlice = firstPageIds.slice(i, i + j);
                    const cacheSlice = cacheIds.slice(0, j);

                    //console.log("Comparing", bookmarkSlice, cacheSlice);

                    if (numberArraysEqual(bookmarkSlice, cacheSlice)) {
                        console.log("Cache hit");
                        matchFound = true;
                        break;
                    }
                }
                if (matchFound) break;
            }

            if (matchFound) {
                const bookmarkCache = (await db.getAllCacheValues(
                    db.mangaCache,
                )) as MangaCacheItem[];

                // Update all bookmark items from bookmarkFirstPage in bookmarkCache
                for (const bookmark of bookmarkFirstPage) {
                    const cachedItemIndex = bookmarkCache.findIndex(
                        (item) => item.id === bookmark.storyid,
                    );
                    if (cachedItemIndex !== -1) {
                        updateBookmark(bookmark);
                    }
                }

                setAllBookmarks(bookmarkCache);
                setWorkerFinished(true);
                return;
            }
        }

        await db.setCache(db.bookmarkCache, "firstPage", bookmarkFirstPage);
        const user_data = localStorage.getItem("accountInfo");

        if (user_data && typeof window !== "undefined" && !workerRef.current) {
            const bookmarkToast = new Toast("Processing bookmarks...", "info", {
                autoClose: false,
            });

            workerRef.current = new Worker("/workers/eventSourceWorker.js");
            workerRef.current.postMessage({ userData: user_data });
            console.log("Worker initialized.");

            workerRef.current.onmessage = (e) => {
                const { type, data, message, details } = e.data;

                if (type === "bookmark") {
                    // Push new bookmark data to the queue
                    messageQueue.current.push(data);

                    // Clear the previous batch timeout and set a new one
                    if (batchTimeout.current)
                        clearTimeout(batchTimeout.current);
                    batchTimeout.current = setTimeout(processBatch, 1000); // Process every 1 second
                } else if (type === "error") {
                    console.error("Worker error:", message, details);
                    workerRef.current?.terminate();
                    bookmarkToast.close();
                    new Toast("Error processing bookmarks.", "error");
                } else if (type === "finished") {
                    console.log("Worker has finished processing.");
                    processBatch(); // Process any remaining bookmarks
                    workerRef.current?.terminate();
                    setWorkerFinished(true);
                    new Toast("Bookmarks processed.", "success");
                    bookmarkToast.close();
                }
            };
        }
    };

    const handlePageChange = useCallback(
        (page: number) => {
            router.push(`/bookmarks?page=${page}`);
        },
        [router],
    );

    const handleSearch = (query: string) => {
        if (!workerFinished) {
            console.warn("Search attempted before worker finished.");
            return;
        }
        if (allBookmarks.length === 0) {
            console.warn("No bookmarks found.");
            return;
        }

        setSearchQuery(query);
        if (query.trim() === "") {
            setSearchResults([]);
        } else {
            const fuse = new Fuse(allBookmarks, fuseOptions);
            const results = fuse.search(query);
            // Limit the number of results, e.g., to 10
            const limitedResults = results
                .slice(0, 10)
                .map((result) => result.item);
            setSearchResults(limitedResults);
        }
    };

    function exportBookmarks() {
        if (!allBookmarks) {
            new Toast("No bookmarks found.", "warning");
            return;
        }

        const bookmarksBlob = new Blob(
            [JSON.stringify(allBookmarks, null, 2)],
            { type: "application/json" },
        );
        const url = URL.createObjectURL(bookmarksBlob);
        const a = Object.assign(document.createElement("a"), {
            href: url,
            download: "bookmarks.json",
        });

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function syncAllBookmarks() {
        console.time("Syncing bookmarks");
        if (!allBookmarks || allBookmarks.length === 0) {
            new Toast("No bookmarks found.", "warning");
            return;
        }

        const syncToast = new Toast("Syncing bookmarks...", "info", {
            autoClose: false,
        });

        const syncBookmarks = async () => {
            for (const bookmark of allBookmarks) {
                const identifier = bookmark.link.split("/").pop();
                if (!identifier) continue;

                const lastReadNumber = bookmark.last_read.split("-").pop();
                const malData = await fetchMalData(identifier, true);

                if (malData && malData.malUrl && lastReadNumber) {
                    const malId = malData.malUrl.split("/").pop();
                    const result = await syncMal(malId, lastReadNumber);
                    console.log(result);
                }

                // Wait a bit between requests to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 350));
            }
        };

        await syncBookmarks();
        syncToast.close();
        console.timeEnd("Syncing bookmarks");
    }

    function getBookmarkCard(bookmark: Bookmark) {
        if (typeof window !== "undefined") {
            return window.innerWidth > 768 ? (
                <DesktopBookmarkCard bookmark={bookmark} />
            ) : (
                <MobileBookmarkCard bookmark={bookmark} />
            );
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 pt-6 pb-8">
                {isLoading && <CenteredSpinner />}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (
                    <>
                        <div className="relative mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={
                                        "w-auto md:h-auto flex items-center justify-center"
                                    }
                                    onClick={exportBookmarks}
                                >
                                    Export Bookmarks
                                </Button>
                                <ConfirmDialog
                                    triggerButton={
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className={
                                                "w-auto md:h-auto flex items-center justify-center bg-blue-600 hover:bg-blue-500"
                                            }
                                        >
                                            Sync Bookmarks
                                        </Button>
                                    }
                                    title="Confirm Bookmark Sync"
                                    message="Are you sure you want to sync your bookmarks to MyAnimeList? It takes approximately 40 seconds per page."
                                    confirmLabel="Confirm"
                                    confirmColor="bg-blue-600 border-blue-500 hover:bg-blue-500"
                                    cancelLabel="Cancel"
                                    onConfirm={syncAllBookmarks}
                                />
                                <div className="relative w-full">
                                    <Input
                                        type="search"
                                        placeholder={
                                            workerFinished
                                                ? "Search bookmarks..."
                                                : "Loading bookmarks, please wait..."
                                        }
                                        value={searchQuery}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="no-cancel"
                                    />
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            {searchResults.length > 0 && (
                                <Card className="absolute z-10 w-full mt-1">
                                    <CardContent className="p-2 max-h-[60vh] overflow-y-scroll">
                                        {searchResults.map((result) => (
                                            <Link
                                                href={`/manga/${result.link.split("/").pop()}`}
                                                key={result.id}
                                                className="block p-2 hover:bg-accent flex items-center rounded-lg"
                                            >
                                                <Image
                                                    src={result.image}
                                                    alt={result.name}
                                                    width={300}
                                                    height={450}
                                                    className="max-h-24 w-auto rounded mr-2"
                                                />
                                                {result.name}
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.noteid}
                                    className="block relative"
                                >
                                    {/* X button in top-right corner */}
                                    <ConfirmDialog
                                        triggerButton={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-5 h-5 md:w-10 md:h-10 absolute top-2 right-2 bg-red-600 text-accent hover:text-red-600 focus:outline-none"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        }
                                        title="Confirm Bookmark Removal"
                                        message="Are you sure you want to remove this bookmark?"
                                        confirmLabel="Remove"
                                        confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                                        cancelLabel="Cancel"
                                        onConfirm={() =>
                                            removeBookmark(
                                                bookmark.bm_data,
                                                bookmark.noteid,
                                            )
                                        }
                                    />
                                    {getBookmarkCard(bookmark)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Footer for pagination */}
            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
            />
        </div>
    );
}
