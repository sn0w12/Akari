"use client";

import { useState, useEffect } from "react";
import { ButtonGroup } from "../ui/button-group";
import { InfoPopover } from "./info-popovers/info";
import { SettingsPopover } from "./info-popovers/settings";
import { CommentsButton } from "./info-popovers/comments";
import { cn } from "@/lib/utils";

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
        }
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
                `flex fixed z-60 bottom-4 left-auto right-4 h-fit md:top-14 transition-opacity`,
                {
                    "opacity-0 pointer-events-none": hidden,
                    "opacity-100": !hidden,
                }
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <ButtonGroup orientation={orientation}>
                <InfoPopover chapter={chapter} orientation={orientation} />
                <SettingsPopover orientation={orientation} />
                <CommentsButton />
            </ButtonGroup>
        </div>
    );
}
