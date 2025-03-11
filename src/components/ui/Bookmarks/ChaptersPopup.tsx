"use client";

import HoverLink from "../hoverLink";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getSetting } from "@/lib/settings";
import { Skeleton } from "../skeleton";

interface Chapter {
    id: string;
    name: string;
    path: string;
    view: string;
    createdAt: string;
}

export const ChaptersPopup: React.FC<{
    chapters: Chapter[];
    onClose: () => void;
    mangaIdentifier: string;
    isLoading: boolean;
    position?: { top: number; left: number };
}> = ({ chapters, onClose, mangaIdentifier, isLoading, position }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ENABLE_ANIMATIONS = getSetting("fancyAnimations");

    const style = position
        ? ({
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateX(-57.5%)", // Center horizontally relative to the anchor point
              zIndex: 50,
          } as React.CSSProperties)
        : {};

    useEffect(() => {
        // Fade in animation for popup
        setIsVisible(true);

        // Handle clicks outside the popup
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".chapters-popup-content")) {
                handleClose(e);
            }
        };

        document.body.addEventListener("click", handleOutsideClick);
        return () => {
            document.body.removeEventListener("click", handleOutsideClick);
        };
    }, []);

    const handleClose = (e: any) => {
        e.stopPropagation();
        if (ENABLE_ANIMATIONS) {
            setIsVisible(false);
            // Allow time for fade out animation before closing
            setTimeout(() => onClose(), 200);
        } else {
            onClose();
        }
    };

    return (
        <div
            className={`absolute right-0 z-10 mt-2 p-4 bg-card border border-border rounded-md shadow-lg w-72 chapters-popup-content ${
                ENABLE_ANIMATIONS
                    ? `transition-opacity duration-200 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`
                    : ""
            }`}
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-1 pb-1 border-b">
                <h4 className="font-semibold px-2">Chapters</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="space-y-2 py-2">
                        {Array(5)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="p-2">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : chapters.length > 0 ? (
                    <ul className="space-y-1">
                        {chapters.map((chapter, index) => (
                            <li key={chapter.id}>
                                <HoverLink
                                    href={`/manga/${mangaIdentifier}/${chapter.id}`}
                                    className="block p-2 hover:bg-accent rounded text-sm"
                                    prefetch={false}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{chapter.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {chapter.createdAt}
                                        </span>
                                    </div>
                                </HoverLink>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        No chapters available
                    </div>
                )}
            </div>
        </div>
    );
};
