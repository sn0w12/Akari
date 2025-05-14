"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { BookmarksContextMenu } from "./BookmarksContextMenu";

export default function BookmarksButton({
    notification,
}: {
    notification: string;
}) {
    return (
        <BookmarksContextMenu>
            <Link href="/bookmarks" className="md:hidden">
                <div className="relative group">
                    <div
                        id="bookmarks-button"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 group-hover:bg-accent border"
                        aria-label="Bookmarks"
                    >
                        <BookmarkIcon className="h-5 w-5" />
                    </div>
                    {/* Badge element */}
                    {notification && notification !== "0" ? (
                        <span
                            className="absolute bg-accent-color text-white text-xs font-bold rounded-full px-2 h-5 flex items-center justify-center transform translate-x-1/4 translate-y-1/4"
                            style={{ bottom: "0", right: "0" }}
                        >
                            {notification}
                        </span>
                    ) : null}
                </div>
            </Link>
        </BookmarksContextMenu>
    );
}
