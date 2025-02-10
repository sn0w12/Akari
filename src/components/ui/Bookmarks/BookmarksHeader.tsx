"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Fuse from "fuse.js";
import React from "react";
import ConfirmDialog from "@/components/ui/confirmDialog";
import Image from "next/image";
import { MangaCacheItem } from "@/app/api/interfaces";
import Toast from "@/lib/toastWrapper";
import { fetchMalData, syncMal } from "@/lib/malSync";

const fuseOptions = {
    keys: ["name"],
    includeScore: false,
    threshold: 0.4,
};

interface BookmarksHeaderProps {
    allBookmarks: MangaCacheItem[];
    workerFinished: boolean;
}

export default function BookmarksHeader({
    allBookmarks,
    workerFinished,
}: BookmarksHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MangaCacheItem[]>([]);
    const [isHoveringResults, setIsHoveringResults] = useState(false);
    const [isHoveringSearchButton, setIsHoveringSearchButton] = useState(false);

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
                    if (!malId) continue;
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

    return (
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
                            disabled={sessionStorage.getItem("mal") !== "true"}
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
                        onChange={(e) => handleSearch(e.target.value)}
                        onBlur={() => {
                            if (!isHoveringResults) {
                                setSearchResults([]);
                            }
                        }}
                        onFocus={() => {
                            if (searchQuery) {
                                handleSearch(searchQuery);
                            }
                        }}
                        className="no-cancel"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
            </div>
            {searchResults.length > 0 && (
                <Card
                    className="absolute z-10 w-full mt-1"
                    onMouseEnter={() => setIsHoveringResults(true)}
                    onMouseLeave={() => setIsHoveringResults(false)}
                >
                    <CardContent className="p-2 max-h-[60vh] overflow-y-scroll">
                        {searchResults.map((result) => (
                            <Link
                                href={`/manga/${result.link.split("/").pop()}`}
                                key={result.id}
                                className={`block p-2 ${isHoveringSearchButton ? "" : "hover:bg-accent"} flex items-center rounded-lg`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <Image
                                            src={result.image}
                                            alt={result.name}
                                            width={300}
                                            height={450}
                                            className="max-h-24 w-auto rounded mr-2"
                                        />
                                        {result.name}
                                    </div>
                                    <Link
                                        href={`/manga/${result.link.split("/").pop()}/${result.last_read}`}
                                    >
                                        <Button
                                            className="z-20"
                                            onMouseEnter={() => {
                                                setIsHoveringSearchButton(true);
                                            }}
                                            onMouseLeave={() => {
                                                setIsHoveringSearchButton(
                                                    false,
                                                );
                                            }}
                                        >
                                            Continue Reading
                                        </Button>
                                    </Link>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
