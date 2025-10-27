"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { getSetting } from "@/lib/settings";
import { Skeleton } from "@/components/ui/skeleton";

export const ChaptersPopup: React.FC<{
    chapters: components["schemas"]["MangaChapter"][];
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
    const popupRef = useRef<HTMLDialogElement>(null);
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

    // Update popup position relative to the button - wrapped with useCallback
    const updatePosition = useCallback(() => {
        if (!buttonRef?.current || !popupRef.current || !position) return;

        // Get current button position
        const buttonRect = buttonRef.current.getBoundingClientRect();

        // Update popup position to match the button's current position
        popupRef.current.style.top = `${buttonRect.bottom}px`;
        popupRef.current.style.left = `${buttonRect.right}px`;
    }, [buttonRef, popupRef, position]);

    const handleClose = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (ENABLE_ANIMATIONS) {
                setIsVisible(false);
                // Allow time for fade out animation before closing
                setTimeout(() => onClose(), 200);
            } else {
                onClose();
            }
        },
        [ENABLE_ANIMATIONS, onClose]
    );

    useEffect(() => {
        // Fade in animation for popup
        setIsVisible(true);
        const mainElement = document.querySelector("main") as HTMLElement;
        if (!mainElement) return;

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
                // Convert the native MouseEvent to a format compatible with our handler
                handleClose(e as unknown as React.MouseEvent);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (popupRef.current) {
            popupRef.current.focus();
        }

        // Initial position update
        updatePosition();

        // Set up event listeners
        document.body.addEventListener("click", handleOutsideClick);
        mainElement.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.removeEventListener("click", handleOutsideClick);
            mainElement.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [updatePosition, handleClose, onClose]);

    return (
        <dialog
            ref={popupRef}
            className={`absolute right-0 z-10 mt-2 p-4 bg-card border border-border rounded-md  w-72 chapters-popup-content ${
                ENABLE_ANIMATIONS
                    ? `transition-opacity duration-200 ease-in-out ${
                          isVisible ? "opacity-100" : "opacity-0"
                      }`
                    : ""
            }`}
            style={style}
            onClick={(e) => e.stopPropagation()}
            open={true}
            aria-label="Chapter selection"
        >
            <div className="flex justify-between items-center mb-1 pb-1 border-b">
                <h4 className="font-semibold px-2">Chapters</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                    aria-label="Close chapter popup"
                >
                    <XIcon className="h-4 w-4" />
                </Button>
            </div>
            <div className="max-h-64 overflow-y-auto" data-scrollbar-custom>
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
                        {chapters.map((chapter) => (
                            <li key={chapter.id}>
                                <Link
                                    href={`/manga/${mangaIdentifier}/${chapter.id}`}
                                    className={`block p-2 mr-1 hover:bg-accent ${
                                        chapter.id ===
                                        `chapter-${lastReadChapter}`
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : ""
                                    } rounded text-sm transition-colors duration-100`}
                                    prefetch={false}
                                    data-no-prefetch
                                    aria-label={`Read ${chapter.title} ${
                                        chapter.id ===
                                        `chapter-${lastReadChapter}`
                                            ? "(Last Read)"
                                            : ""
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{chapter.title}</span>
                                        <span
                                            className={`text-xs ${
                                                chapter.id ===
                                                `chapter-${lastReadChapter}`
                                                    ? "text-white"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {chapter.createdAt}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        No chapters available
                    </div>
                )}
            </div>
        </dialog>
    );
};
