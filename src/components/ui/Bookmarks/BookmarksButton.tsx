"use client";

import HoverLink from "../hoverLink";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
    LinkContextMenuItems,
} from "@/components/ui/context-menu";
import { Bookmark } from "@/app/api/interfaces";
import { fetchBookmarks } from "@/components/Bookmarks";
import { useState } from "react";
import { Skeleton } from "../skeleton";
import { compareVersions } from "@/lib/bookmarks";

interface ProcessedBookmark {
    name: string;
    image: string;
    link: string;
    current_chapter: string;
    current_chapter_link: string;
    last_chapter: string;
    last_chapter_link: string;
    up_to_date: boolean;
    has_new_chapter: boolean;
    color: string;
}

export default function BookmarksButton({
    notification,
}: {
    notification: string;
}) {
    const [bookmarks, setBookmarks] = useState<ProcessedBookmark[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadBookmarks = async () => {
        setIsLoading(true);
        const data = await fetchBookmarks(1);
        let processedBookmarks: ProcessedBookmark[] = [];
        data?.bookmarks.forEach((bookmark: Bookmark) => {
            const upToDate =
                bookmark.chapterlastnumber === bookmark.chapter_numbernow;
            const hasNewChapter = compareVersions(
                bookmark.chapterlastnumber,
                bookmark.chapter_numbernow,
            );

            let color = "bg-accent-color hover:bg-accent-color/70";
            if (upToDate) {
                color = "bg-green-600 hover:bg-green-700";
            }
            if (hasNewChapter) {
                color = "bg-cyan-600 hover:bg-cyan-700";
            }

            processedBookmarks.push({
                name: bookmark.storyname,
                image: bookmark.image,
                link: `/manga/${bookmark.link_story.split("/")[3]}`,
                current_chapter: bookmark.chapter_numbernow,
                current_chapter_link: `/manga/${bookmark.link_chapter_now.split("/").slice(3, 5).join("/")}`,
                last_chapter: bookmark.chapterlastnumber,
                last_chapter_link: `/manga/${bookmark.link_chapter_last.split("/").slice(3, 5).join("/")}`,
                up_to_date: upToDate,
                has_new_chapter: hasNewChapter,
                color: color,
            });
        });

        setBookmarks((processedBookmarks || []).slice(0, 5));
        setIsLoading(false);
    };

    const handleLinkClick = () => {
        const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            bubbles: true,
        });
        document.dispatchEvent(escEvent);
    };

    return (
        <ContextMenu onOpenChange={(open) => open && loadBookmarks()}>
            <ContextMenuTrigger id="bookmarks-context-trigger">
                <HoverLink
                    href="/bookmarks"
                    className={!notification ? "pointer-events-none" : ""}
                >
                    <div className="relative group">
                        <Button
                            id="bookmarks-button"
                            variant="ghost"
                            size="icon"
                            className="group-hover:bg-accent border"
                            disabled={!notification}
                        >
                            <BookmarkIcon className="h-5 w-5" />
                        </Button>
                        {/* Badge element */}
                        {notification && notification != "0" && (
                            <span
                                className="absolute bg-accent-color text-white text-xs font-bold rounded-full px-2 h-5 flex items-center justify-center transform translate-x-1/4 translate-y-1/4"
                                style={{ bottom: "0", right: "0" }}
                            >
                                {notification}
                            </span>
                        )}
                    </div>
                </HoverLink>
            </ContextMenuTrigger>

            <ContextMenuContent
                className="w-96 z-[2000]"
                id="bookmarks-context"
            >
                <LinkContextMenuItems href={"/bookmarks"} />
                <ContextMenuSeparator />

                {isLoading
                    ? Array(5)
                          .fill(0)
                          .map((_, index) => (
                              <ContextMenuItem
                                  key={`skeleton-${index}`}
                                  className="p-0"
                              >
                                  <div className="flex items-stretch w-full py-2 px-2 gap-2">
                                      <div className="flex-shrink-0">
                                          <Skeleton className="w-16 h-[91px] rounded-md" />
                                      </div>
                                      <div className="flex flex-col justify-between gap-2 flex-1 min-w-0">
                                          <div className="flex-grow">
                                              <Skeleton className="h-4 rounded-md w-3/4 mb-1" />
                                              <Skeleton className="h-4 rounded-md w-1/2" />
                                          </div>
                                          <div className="flex gap-1 justify-between">
                                              <Skeleton className="h-9 rounded-md flex-grow" />
                                              <Skeleton className="h-9 rounded-md flex-grow" />
                                          </div>
                                      </div>
                                  </div>
                              </ContextMenuItem>
                          ))
                    : bookmarks.map((bookmark, index) => (
                          <ContextMenuItem
                              key={index}
                              className="p-0 cursor-pointer"
                          >
                              <div className="flex items-stretch w-full py-2 px-2 gap-2">
                                  <Link
                                      href={bookmark.link}
                                      onClick={handleLinkClick}
                                  >
                                      <Image
                                          src={bookmark.image}
                                          height={91}
                                          width={64}
                                          alt={bookmark.name}
                                          className="w-16 h-[91px] object-cover bg-primary rounded-md flex-shrink-0"
                                      />
                                  </Link>
                                  <div className="flex flex-col justify-between gap-2 flex-1 min-w-0">
                                      <Link
                                          href={bookmark.link}
                                          className="flex-grow"
                                          onClick={handleLinkClick}
                                      >
                                          <span className="line-clamp-2">
                                              {bookmark.name}
                                          </span>
                                      </Link>
                                      <div className="flex gap-1 justify-between">
                                          {bookmark.up_to_date ||
                                          bookmark.has_new_chapter ? (
                                              <HoverLink
                                                  className={`${bookmark.color} flex-grow text-center px-2 py-1.5 rounded-md transition-colors`}
                                                  href={
                                                      bookmark.last_chapter_link
                                                  }
                                                  onClick={handleLinkClick}
                                              >
                                                  Chapter{" "}
                                                  {bookmark.last_chapter}
                                              </HoverLink>
                                          ) : (
                                              <>
                                                  <HoverLink
                                                      className="bg-accent-color hover:bg-accent-color/70 flex-grow text-center px-2 py-1.5 rounded-md transition-colors"
                                                      href={
                                                          bookmark.current_chapter_link
                                                      }
                                                      onClick={handleLinkClick}
                                                  >
                                                      Chapter{" "}
                                                      {bookmark.current_chapter}
                                                  </HoverLink>
                                                  <HoverLink
                                                      className="bg-green-600 hover:bg-green-700 flex-grow text-center px-2 py-1.5 rounded-md transition-colors"
                                                      href={
                                                          bookmark.last_chapter_link
                                                      }
                                                      onClick={handleLinkClick}
                                                  >
                                                      Chapter{" "}
                                                      {bookmark.last_chapter}
                                                  </HoverLink>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </ContextMenuItem>
                      ))}
            </ContextMenuContent>
        </ContextMenu>
    );
}
