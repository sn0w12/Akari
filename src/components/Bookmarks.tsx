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
import { link } from "fs";

interface Bookmark {
  noteid: string;
  note_story_name: string;
  chapter_numbernow: string;
  chapter_namenow: string;
  link_chapter_now: string;
  storyid: string;
  storyname: string;
  link_story: string;
  image: string;
  chapterlastname: string;
  chapterlastdateupdate: string;
  link_chapter_last: string;
  bm_data: string;
}

const fuseOptions = {
  keys: ["note_story_name"], // The fields to search in your data
  includeScore: false, // Optional: include the score in the results
  threshold: 0.4, // Adjust the fuzziness (0.0 = exact match, 1.0 = match all)
};

let worker: Worker | null = null;
let workerInitialized = false;

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
        `/api/bookmarks?page=${page}&user_data=${encodeURIComponent(user_data)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks.");
      }
      const data = await response.json();
      setBookmarks(data.bookmarks);
      setCurrentPage(data.page);
      setTotalPages(Number(data.totalPages));
      setError(null); // Clear any previous errors
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

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
        prevBookmarks.filter((bookmark) => bookmark.noteid !== noteid)
      );
    }
  }

  // Fetch bookmarks on component mount and whenever the page changes
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    fetchBookmarks(page);
  }, [searchParams]);

  const processBatch = () => {
    if (messageQueue.current.length > 0) {
      // Add all new bookmarks in the batch to the state
      setAllBookmarks((prevBookmarks) => {
        const uniqueBookmarks = messageQueue.current.filter(
          (newBookmark) =>
            !prevBookmarks.some(
              (bookmark) => bookmark.storyid === newBookmark.storyid
            )
        );
        return [...prevBookmarks, ...uniqueBookmarks];
      });

      // Update localStorage once per batch
      const storedData = JSON.parse(localStorage.getItem("bm_data") || "{}");
      const lastReadData = JSON.parse(
        localStorage.getItem("last_read") || "{}"
      );
      const linkIdMap = JSON.parse(localStorage.getItem("link_id_map") || "{}");
      messageQueue.current.forEach((bookmark) => {
        storedData[bookmark.storyid] = bookmark.bm_data;
        lastReadData[bookmark.storyid] = bookmark.link_chapter_now
          .split("/")
          .pop();
        const linkStoryId = bookmark.link_story.split("/").pop() || "";
        linkIdMap[linkStoryId] = bookmark.storyid;
      });
      localStorage.setItem("bm_data", JSON.stringify(storedData));
      localStorage.setItem("last_read", JSON.stringify(lastReadData));
      localStorage.setItem("link_id_map", JSON.stringify(linkIdMap));

      // Clear the queue
      messageQueue.current = [];
    }
  };

  useEffect(() => {
    const user_data = localStorage.getItem("accountInfo");
    if (user_data && typeof window !== "undefined" && !workerRef.current) {
      workerRef.current = new Worker("/workers/eventSourceWorker.js");
      workerRef.current.postMessage({ userData: user_data });
      console.log("Worker initialized.");

      workerRef.current.onmessage = (e) => {
        const { type, data, message, error } = e.data;

        if (type === "bookmark") {
          // Push new bookmark data to the queue
          messageQueue.current.push(data);

          // Clear the previous batch timeout and set a new one
          if (batchTimeout.current) clearTimeout(batchTimeout.current);
          batchTimeout.current = setTimeout(processBatch, 1000); // Process every 1 second
        } else if (type === "error") {
          console.error("Worker error:", message, error);
          workerRef.current?.terminate();
        } else if (type === "finished") {
          console.log("Worker has finished processing.");
          processBatch(); // Process any remaining bookmarks
          workerRef.current?.terminate();
          setWorkerFinished(true);
        }
      };
    }

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
    [router]
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
      const limitedResults = results.slice(0, 10).map((result) => result.item);
      setSearchResults(limitedResults);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        {isLoading && <CenteredSpinner />}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="space-y-6">
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
            {bookmarks.map((bookmark) => (
              <div key={bookmark.noteid} className="block relative">
                {/* X button in top-right corner */}
                <ConfirmDialog
                  triggerButton={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 focus:outline-none"
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
                    removeBookmark(bookmark.bm_data, bookmark.noteid)
                  }
                />
                <Card className="flex flex-col md:flex-row items-center p-6 shadow-lg bg-card border border-border rounded-lg">
                  <div className="w-full md:w-40 mb-4 md:mb-0">
                    <Image
                      src={bookmark.image}
                      alt={bookmark.storyname}
                      width={300}
                      height={450}
                      className="w-full h-auto object-cover rounded"
                    />
                  </div>
                  <CardContent className="ml-4 flex flex-col justify-between">
                    <div className="mb-4">
                      <Link
                        href={`/manga/${bookmark.link_story.split("/").pop()}`}
                      >
                        <h3 className="font-bold text-2xl mb-2 hover:underline">
                          {bookmark.storyname}
                        </h3>
                      </Link>
                      {/* Continue Reading Button */}
                      <a
                        href={`/manga/${bookmark.link_story
                          .split("/")
                          .pop()}/${bookmark.link_chapter_now
                          .split("/")
                          .pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-4"
                      >
                        <Button className="py-4 px-6 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          Continue Reading - Chapter{" "}
                          {bookmark.chapter_numbernow}
                        </Button>
                      </a>
                    </div>

                    {/* Latest Chapter Info */}
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Latest Chapter:{" "}
                        <a
                          href={`/manga/${bookmark.link_story
                            .split("/")
                            .pop()}/${bookmark.link_chapter_last
                            .split("/")
                            .pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {bookmark.chapterlastname}
                        </a>
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated: {bookmark.chapterlastdateupdate}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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
