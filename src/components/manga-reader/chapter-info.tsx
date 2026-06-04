import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ButtonGroup } from "../ui/group";
import { CommentsButton } from "./info-popovers/comments";
import { InfoPopover } from "./info-popovers/info";
import { SettingsPopover } from "./info-popovers/settings";
import { useSidebar } from "../ui/sidebar";

export function ChapterInfo({
    chapter,
    hidden,
}: {
    chapter: components["schemas"]["ChapterResponse"];
    hidden: boolean;
}) {
    const { open } = useSidebar();
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
                `flex fixed z-50 bottom-16 left-auto h-fit md:left-16 md:top-14 transition-[opacity,left] ease-snappy`,
                {
                    "opacity-0 pointer-events-none": hidden,
                    "opacity-100": !hidden,
                    "md:left-16": !open,
                    "md:left-68": open,
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
                        <InfoPopover chapter={chapter} />
                        <SettingsPopover orientation={orientation} />
                    </>
                ) : (
                    <InfoPopover chapter={chapter} />
                )}
                <CommentsButton mangaType={chapter.type} />
            </ButtonGroup>
        </div>
    );
}
