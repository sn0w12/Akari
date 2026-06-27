import { useBorderColor } from "@/contexts/border-color-context";
import { useBodyScrollListener } from "@/hooks/use-body-scroll-listener";
import { getSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { useEffect, useState } from "react";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { ViewManga } from "./manga-details/view-manga";
import PageReader from "./manga-reader/readers/page-reader";
import StripReader from "./manga-reader/readers/strip-reader";

interface ReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
}

export function Reader({ chapter }: ReaderProps) {
    const readerModeStorage = useStorage("readerMode", {
        mangaId: chapter.mangaId,
        chapterId: chapter.id,
    });
    const { flashColor } = useBorderColor();
    const [isStripMode, setIsStripMode] = useState<boolean>(() => {
        const stored = readerModeStorage.get();
        if (stored && typeof stored.isStripMode === "boolean") {
            return stored.isStripMode;
        }

        const readerType = getSetting("readerType");
        if (readerType === "page") return false;
        if (readerType === "strip") return true;

        return ["Manhwa", "Manhua"].includes(chapter.type);
    });

    const [bookmarkState, setBookmarkState] = useState<boolean | null>(null);
    useEffect(() => {
        if (bookmarkState !== null) {
            flashColor(
                bookmarkState ? "border-accent-positive" : "border-destructive",
            );
        }
    }, [bookmarkState, flashColor]);

    const [scrollMetrics, setScrollMetrics] = useState({
        pixels: 0,
        percentage: 0,
        clientHeight: 0,
    });

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        readerModeStorage.set({ isStripMode: isStrip });
    }

    function toggleReaderMode(override: boolean = true) {
        if (isStripMode !== undefined) {
            void setReaderMode(!isStripMode);
        } else {
            void setReaderMode(override);
        }
    }

    const calculateScrollMetrics = (mainElement: HTMLElement) => {
        const scrollTop = mainElement.scrollTop;
        const scrollHeight = mainElement.scrollHeight;
        const clientHeight = mainElement.clientHeight;

        // Calculate percentage
        const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollMetrics({
            pixels: scrollTop,
            percentage: Math.min(100, Math.max(0, percentage)),
            clientHeight,
        });
    };

    const handleScroll = useThrottledCallback(
        (mainElement: HTMLElement) => {
            calculateScrollMetrics(mainElement);
        },
        {
            wait: 100,
        },
    );
    useBodyScrollListener(handleScroll);

    return (
        <>
            <BreadcrumbSetter
                orig={chapter.mangaId}
                title={chapter.mangaTitle}
            />
            <ViewManga mangaId={chapter.mangaId} />
            {isStripMode ? (
                <StripReader
                    chapter={chapter}
                    scrollMetrics={scrollMetrics}
                    toggleReaderMode={toggleReaderMode}
                    setBookmarkState={setBookmarkState}
                />
            ) : (
                <PageReader
                    chapter={chapter}
                    toggleReaderMode={toggleReaderMode}
                    setBookmarkState={setBookmarkState}
                />
            )}
        </>
    );
}
