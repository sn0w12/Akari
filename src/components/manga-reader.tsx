import { useBorderColor } from "@/contexts/border-color-context";
import { getSetting } from "@/lib/settings";
import { useStorage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { ViewManga } from "./manga-details/view-manga";
import PageReader from "./manga-reader/readers/page-reader";
import StripReader from "./manga-reader/readers/strip-reader";
import { useSensory } from "@/hooks/use-sensory";

interface ReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
}

export function Reader({ chapter }: ReaderProps) {
    const readerModeStorage = useStorage("readerMode", {
        mangaId: chapter.mangaId,
        chapterId: chapter.id,
    });
    const { flashColor } = useBorderColor();
    const { trigger } = useSensory();
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
        if (bookmarkState === null) return;

        flashColor(
            bookmarkState ? "border-accent-positive" : "border-destructive",
        );

        if (bookmarkState) {
            trigger("success");
        } else {
            trigger("error");
        }
    }, [bookmarkState, flashColor, trigger]);

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

    return (
        <div>
            <BreadcrumbSetter
                orig={chapter.mangaId}
                title={chapter.mangaTitle}
            />
            <ViewManga mangaId={chapter.mangaId} />
            {isStripMode ? (
                <StripReader
                    chapter={chapter}
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
        </div>
    );
}
