"use client";

import { useState, useEffect } from "react";
import { ButtonGroup } from "../ui/button-group";
import { InfoPopover } from "./info-popovers/info";
import { SettingsPopover } from "./info-popovers/settings";
import { CommentsButton } from "./info-popovers/comments";

export function ChapterInfo({
    chapter,
}: {
    chapter: components["schemas"]["ChapterResponse"];
}) {
    const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
        "horizontal"
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (e: MediaQueryListEvent) => {
            setOrientation(e.matches ? "vertical" : "horizontal");
        };

        setOrientation(mediaQuery.matches ? "vertical" : "horizontal");
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <div
            className={`flex fixed z-60 bottom-4 left-auto right-4 h-fit md:top-14`}
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
