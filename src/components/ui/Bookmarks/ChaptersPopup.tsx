"use client";

import HoverLink from "../hoverLink";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
    lastReadChapter?: string;
    position?: { top: number; left: number };
    buttonRef?: React.RefObject<HTMLButtonElement>;
}> = ({
    chapters,
    onClose,
    mangaIdentifier,
    isLoading,
    lastReadChapter,
    position,
    buttonRef,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ENABLE_ANIMATIONS = getSetting("fancyAnimations");
    const popupRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Initial positioning
    const style = position
        ? ({
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateX(-57.5%)",
              zIndex: 30,
          } as React.CSSProperties)
        : {};

    // Update popup position relative to the button
    const updatePosition = () => {
        if (!buttonRef?.current || !popupRef.current || !position) return;

        // Get current button position
        const buttonRect = buttonRef.current.getBoundingClientRect();

        // Update popup position to match the button's current position
        popupRef.current.style.top = `${buttonRect.bottom}px`;
        popupRef.current.style.left = `${buttonRect.right}px`;
    };

    useEffect(() => {
        // Fade in animation for popup
        setIsVisible(true);

        // Update position on scroll using animation frame for smoothness
        const handleScroll = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(updatePosition);
        };

        // Handle clicks outside the popup
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".chapters-popup-content")) {
                handleClose(e);
            }
        };

        // Initial position update
        updatePosition();

        // Set up event listeners
        document.body.addEventListener("click", handleOutsideClick);
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        return () => {
            document.body.removeEventListener("click", handleOutsideClick);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
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
            ref={popupRef}
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
                                    className={`block p-2 mr-1 ${index === 0 ? "bg-green-600 hover:bg-green-700" : "hover:bg-accent"} ${chapter.id === `chapter-${lastReadChapter}` ? "bg-indigo-600 hover:bg-indigo-700" : ""} rounded text-sm transition-colors duration-100`}
                                    prefetch={false}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{chapter.name}</span>
                                        <span
                                            className={`text-xs ${index === 0 || chapter.id === `chapter-${lastReadChapter}` ? "text-foreground" : "text-muted-foreground"}`}
                                        >
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
