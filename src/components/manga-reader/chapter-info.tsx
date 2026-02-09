"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ButtonGroup } from "../ui/button-group";
import { CommentsButton } from "./info-popovers/comments";
import { InfoPopover } from "./info-popovers/info";
import { SettingsPopover } from "./info-popovers/settings";

export function ChapterInfo({
    chapter,
    hidden,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    hidden: boolean;
}) {
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
        () => {
            if (typeof window !== "undefined") {
                return window.matchMedia("(min-width: 768px)").matches
                    ? "vertical"
                    : "horizontal";
            }
            return "horizontal";
        },
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (e: MediaQueryListEvent) => {
            setOrientation(e.matches ? "vertical" : "horizontal");
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <div
            className={cn(
                `flex fixed z-50 bottom-16 left-auto right-4 h-fit md:top-14 transition-opacity`,
                {
                    "opacity-0 pointer-events-none": hidden,
                    "opacity-100": !hidden,
                },
            )}
            style={
                orientation === "horizontal"
                    ? {
                          bottom: "calc(calc(var(--spacing) * 16) + var(--safe-bottom))",
                      }
                    : {}
            }
        >
            <ButtonGroup orientation={orientation}>
                {orientation === "vertical" ? (
                    <>
                        <InfoPopover
                            chapter={chapter}
                            orientation={orientation}
                        />
                        <SettingsPopover orientation={orientation} />
                    </>
                ) : (
                    <InfoPopover chapter={chapter} orientation={orientation} />
                )}
                <CommentsButton
                    chapterNumber={chapter.number}
                    mangaType={chapter.type}
                />
            </ButtonGroup>
        </div>
    );
}
