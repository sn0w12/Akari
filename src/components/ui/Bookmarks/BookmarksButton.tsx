"use client";

import HoverLink from "../hoverLink";
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
            <HoverLink href="/bookmarks">
                <div className="relative group md:hidden">
                    <Button
                        id="bookmarks-button"
                        variant="ghost"
                        size="icon"
                        className="group-hover:bg-accent border"
                    >
                        <BookmarkIcon className="h-5 w-5" />
                    </Button>
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
            </HoverLink>
        </BookmarksContextMenu>
    );
}
