import { Image } from "@/components/image";
import { useWindowWidth } from "@/hooks/use-window-width";
import { syncAllServices } from "@/lib/manga/sync";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChapterInfo } from "../chapter-info";
import EndOfManga from "../end-of-manga";
import MangaFooter from "../manga-footer";
import PageProgress from "../page-progress";

interface PageReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
    scanlator: string;
    scrollMetrics: { pixels: number; percentage: number };
    toggleReaderMode: () => void;
    isInactive: boolean;
    setBookmarkState: (state: boolean | null) => void;
}

export default function PageReader({
    chapter,
    scanlator,
    scrollMetrics,
    toggleReaderMode,
    isInactive,
    setBookmarkState,
}: PageReaderProps) {
    const router = useRouter();
    const searchParams = useRouterState({ select: (s) => s.location.search });
    const readingDir = useSetting("readingDirection");
    const continueAfterChapter = useSetting("continueAfterChapter");
    const windowWidth = useWindowWidth();
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.page;
        if (!chapter) return 0;
        if (!pageParam) return 0;
        if (pageParam === "last") return chapter.images.length - 1;
        if (typeof pageParam === "string") return 0;

        return isNaN(pageParam) ||
            pageParam < 1 ||
            pageParam > chapter.images.length
            ? 0
            : pageParam - 1;
    });
    const pageHeightStyle = "var(--visible-height)";
    const bookmarkUpdatedRef = useRef(false);
    const hasPrefetchedRef = useRef(false);

    const chapterRef = useRef(chapter);
    chapterRef.current = chapter;
    const imagesLength = chapter.images.length;
    const nextChapter = chapter.nextChapter;
    useEffect(() => {
        if (!chapterRef.current) return;

        const isHalfwayThrough =
            currentPage >= Math.floor(imagesLength / 2);
        if (isHalfwayThrough && !bookmarkUpdatedRef.current) {
            bookmarkUpdatedRef.current = true;
            syncAllServices(chapterRef.current).then((success) => {
                setBookmarkState(success);
            });
        }

        if (nextChapter && !hasPrefetchedRef.current) {
            const threshold = Math.min(
                Math.floor(imagesLength * 0.75),
                imagesLength - 3,
            );

            if (currentPage >= threshold) {
                hasPrefetchedRef.current = true;
            }
        }
    }, [currentPage, imagesLength, nextChapter, router, setBookmarkState]);

    const setPageWithUrlUpdate = useCallback((newPage: number) => {
        setCurrentPage(newPage);

        if (typeof window === "undefined") return;
        // Use history.replaceState to update URL without triggering Next.js re-renders
        window.history.replaceState(null, "", `?page=${newPage + 1}`);
    }, []);

    const nextPage = useCallback(() => {
        if (
            currentPage === chapter.images.length - 1 &&
            chapter.nextChapter &&
            continueAfterChapter
        ) {
            router.navigate({ to: `./${chapter.nextChapter}` });
            return;
        }

        if (currentPage < chapter.images.length) {
            setPageWithUrlUpdate(currentPage + 1);
        }
    }, [
        currentPage,
        chapter.images.length,
        chapter.nextChapter,
        router,
        continueAfterChapter,
        setPageWithUrlUpdate,
    ]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setPageWithUrlUpdate(currentPage - 1);
        }
    }, [currentPage, setPageWithUrlUpdate]);

    useShortcutSetting("nextPage", nextPage);
    useShortcutSetting("previousPage", prevPage);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const screenWidth = windowWidth;
            const clickX = e.clientX;
            const middleZoneStart = screenWidth * 0.4;
            const middleZoneEnd = screenWidth * 0.6;

            if (readingDir === "rtl") {
                if (clickX > middleZoneEnd) {
                    prevPage();
                } else if (clickX < middleZoneStart) {
                    nextPage();
                }
            } else {
                if (clickX > middleZoneEnd) {
                    nextPage();
                } else if (clickX < middleZoneStart) {
                    prevPage();
                }
            }
        },
        [nextPage, prevPage, readingDir, windowWidth],
    );

    return (
        <>
            <ChapterInfo
                chapter={chapter}
                scanlator={scanlator}
                hidden={scrollMetrics.pixels >= 50}
            />
            <div
                className="w-full h-full flex flex-col relative"
                style={{ height: pageHeightStyle }}
            >
                <div className="flex flex-col h-full">
                    {/* Spacer for 1/3 of available space at the top */}
                    <div className="flex-1"></div>
                    {/* Content container: image or end-of-manga, no shrinking/growing */}
                    <div className="flex-shrink-0" onClick={handleClick}>
                        {chapter.images[currentPage] && (
                            <Image
                                src={chapter.images[currentPage]}
                                alt={`Page ${currentPage + 1}`}
                                className={cn("w-full h-auto object-contain", {
                                    "cursor-none":
                                        isInactive &&
                                        currentPage !== chapter.images.length,
                                    "cursor-pointer":
                                        !isInactive &&
                                        currentPage !== chapter.images.length,
                                })}
                                style={{
                                    maxHeight: pageHeightStyle,
                                }}
                                width={720}
                                height={1500}
                                quality={100}
                                fetchPriority="high"
                                sizes={{ default: "100vw" }}
                            />
                        )}
                        <EndOfManga
                            title={chapter.title}
                            identifier={chapter.mangaId}
                            className={`${
                                currentPage !== chapter.images.length
                                    ? "hidden"
                                    : ""
                            }`}
                        />
                    </div>
                    {/* Spacer for 2/3 of available space at the bottom */}
                    <div style={{ flex: 2 }}></div>
                </div>
                <div className={"hidden"}>
                    {typeof chapter.images[currentPage + 1] === "string" && (
                        <Image
                            src={chapter.images[currentPage + 1] as string}
                            alt={`Page ${currentPage + 2}`}
                            className="w-full h-auto max-h-screen object-contain"
                            style={{
                                maxHeight: pageHeightStyle,
                            }}
                            width={720}
                            height={1500}
                            quality={100}
                            sizes={{ default: "100vw" }}
                        />
                    )}
                </div>
            </div>
            <div
                className={`sm:opacity-0 lg:opacity-100 transition-opacity duration-300 ${
                    currentPage !== chapter.images.length
                        ? "block"
                        : "hidden md:block"
                }`}
            >
                <PageProgress
                    currentPage={Math.max(
                        0,
                        Math.min(currentPage, chapter.images.length - 1),
                    )}
                    totalPages={chapter.images.length}
                    setCurrentPage={(page) => {
                        setPageWithUrlUpdate(page);
                    }}
                    hidden={scrollMetrics.pixels >= 50}
                />
            </div>
            <MangaFooter
                chapter={chapter}
                scanlator={scanlator}
                toggleReaderMode={toggleReaderMode}
            />
        </>
    );
}
