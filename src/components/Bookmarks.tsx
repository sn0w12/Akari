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
import { Bookmark } from "@/app/api/interfaces";
import DesktopBookmarkCard from "./ui/Bookmarks/DesktopBookmarkCard";
import MobileBookmarkCard from "./ui/Bookmarks/MobileBookmarkCard";
import Toast from "@/lib/toastWrapper";

const fuseOptions = {
    keys: ["note_story_name"], // The fields to search in your data
    includeScore: false, // Optional: include the score in the results
    threshold: 0.4, // Adjust the fuzziness (0.0 = exact match, 1.0 = match all)
};

export default function BookmarksPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [allBookmarks, setAllBookmarks] = useState<Bookmark[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Bookmark[]>([]);
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
            db.setCache(
                db.bookmarkCache,
                "allBookmarksTotalPages",
                data.totalPages,
            );

            const updateBookmarkImages = async (bookmarks: Bookmark[]) => {
                await Promise.all(
                    bookmarks.map(async (bookmark: Bookmark) => {
                        bookmark.image = await getHqImage(
                            bookmark.link_story?.split("/").pop() || "",
                            bookmark.image,
                        );
                    }),
                );

                return bookmarks;
            };

            data.bookmarks = await updateBookmarkImages(data.bookmarks);
            setBookmarks(data.bookmarks);
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

    const processBatch = () => {
        if (messageQueue.current.length > 0) {
            // Add all new bookmarks in the batch to the state
            setAllBookmarks((prevBookmarks) => {
                const uniqueBookmarks = messageQueue.current.filter(
                    (newBookmark) =>
                        !prevBookmarks.some(
                            (bookmark) =>
                                bookmark.storyid === newBookmark.storyid,
                        ),
                );
                return [...prevBookmarks, ...uniqueBookmarks];
            });

            const allBookmarks: Bookmark[] = [];

            messageQueue.current.forEach((bookmark) => {
                allBookmarks.push(bookmark);
                const cacheObject = {
                    bm_data: bookmark.bm_data,
                    last_read: bookmark.link_chapter_now.split("/").pop(),
                    id: bookmark.storyid,
                };
                const storyId = bookmark.link_story.split("/").pop();
                if (storyId) {
                    db.setCache(db.mangaCache, storyId, cacheObject);
                }
            });

            db.setCache(db.bookmarkCache, "allBookmarks", allBookmarks);
            // Clear the queue
            messageQueue.current = [];
        }
    };

    useEffect(() => {
        const initWorker = async () => {
            // Fetch bookmark cache asynchronously
            const bookmarkCache = (await db.getCache(
                db.bookmarkCache,
                "allBookmarks",
                1000 * 60 * 60 * 1, // 1-hour expiration
            )) as Bookmark[];
            let bookmarksTotalPages = await db.getCache(
                db.bookmarkCache,
                "allBookmarksTotalPages",
            );
            if (!bookmarksTotalPages) bookmarksTotalPages = 0;
            if (
                bookmarkCache &&
                Math.ceil(bookmarkCache.length / 20) == bookmarksTotalPages
            ) {
                setAllBookmarks(bookmarkCache);
                setWorkerFinished(true);
                return;
            }

            const user_data = localStorage.getItem("accountInfo");

            if (
                user_data &&
                typeof window !== "undefined" &&
                !workerRef.current
            ) {
                const bookmarkToast = new Toast(
                    "Processing bookmarks...",
                    "info",
                    {
                        autoClose: false,
                    },
                );

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

        // Call the async function inside useEffect
        initWorker();

        // Cleanup function to terminate the worker on unmount
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
            if (batchTimeout.current) {
                clearTimeout(batchTimeout.current);
            }
        };
    }, []);

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
                            <Input
                                type="search"
                                placeholder={
                                    workerFinished
                                        ? "Search bookmarks..."
                                        : "Loading bookmarks, please wait..."
                                }
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full no-cancel"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            {searchResults.length > 0 && (
                                <Card className="absolute z-10 w-full mt-1">
                                    <CardContent className="p-2">
                                        {searchResults.map((result) => (
                                            <Link
                                                href={`/manga/${result.link_story.split("/").pop()}`}
                                                key={result.noteid}
                                                className="block p-2 hover:bg-accent flex items-center rounded-lg"
                                            >
                                                <Image
                                                    src={result.image}
                                                    alt={result.note_story_name}
                                                    width={300}
                                                    height={450}
                                                    className="max-h-24 w-auto rounded mr-2"
                                                />
                                                {result.note_story_name}
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
