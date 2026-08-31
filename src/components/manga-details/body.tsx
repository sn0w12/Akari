import type { components } from "@/types/api";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersJsonLd } from "./tabs/chapters-jsonld";
import { MangaRecommendations } from "./tabs/recommended";
import { MangaRelationships } from "./tabs/relationships";
import { ScrollArea } from "../ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { ChapterEntry, fillChapterGaps } from "@/lib/manga/chapters";
import { getLatestReadChapter } from "@/lib/manga/bookmarks";
import { toastManager } from "../ui/toast";
import { ChapterCard, ChaptersControls } from "./tabs/chapters";
import { Button } from "../ui/button";
import { ButtonLink } from "../ui/button-link";

type MangaDetailsTab = "chapters" | "recommendations" | "relationships";

const CHAPTERS_PER_PAGE = 24;

function chapterParams(mangaId: string, scanlatorId: number, number: number) {
    return {
        mangaId,
        scanlator: String(scanlatorId),
        subId: String(number),
    };
}

function sortChapters(
    chapters: ChapterEntry[],
    order: "asc" | "desc",
): ChapterEntry[] {
    return [...chapters].sort((a, b) =>
        order === "asc" ? a.number - b.number : b.number - a.number,
    );
}

export function MangaDetailsBody({
    rawChapters,
    mangaId,
}: {
    rawChapters: components["schemas"]["MangaChapterResponse"];
    mangaId: string;
}) {
    const [activeTab, setActiveTab] = useState<MangaDetailsTab>("chapters");
    const [hasOpenedRecommendations, setHasOpenedRecommendations] =
        useState(false);
    const [hasOpenedRelationships, setHasOpenedRelationships] = useState(false);

    const { data: user, isLoading: isUserLoading } = useUser();

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentScanlatorId, setCurrentScanlatorId] = useState<number>(
        rawChapters.preferredScanlatorId ??
            rawChapters.chapters[0]?.scanlatorId ??
            1,
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);

    const chapters = useMemo(
        () => fillChapterGaps(currentScanlatorId, rawChapters.chapters),
        [rawChapters, currentScanlatorId],
    );

    const sortedChapters = useMemo(
        () => sortChapters(chapters, sortOrder),
        [chapters, sortOrder],
    );

    const { data: lastReadData, isLoading: isLastReadLoading } = useQuery({
        queryKey: ["last-read", mangaId],
        queryFn: () => getLatestReadChapter(mangaId),
        enabled: !!mangaId && !!user,
    });

    const lastReadChapterId = lastReadData?.chapterId ?? undefined;

    // When the last-read bookmark loads, switch the scanlator filter to the
    // scanlator that published the last-read chapter so it's visible.
    useEffect(() => {
        if (!lastReadChapterId) return;
        const lastReadChapter = chapters.find(
            (chapter) => chapter.id === lastReadChapterId,
        );
        if (!lastReadChapter) return;
        setCurrentScanlatorId(lastReadChapter.scanlatorId);
    }, [lastReadChapterId, chapters]);

    // Scroll to the target chapter once the page/filter it lives on has
    // re-rendered and the element exists in the DOM.
    useEffect(() => {
        if (!scrollTargetId) return;
        setScrollTargetId(null);
        document
            .getElementById(scrollTargetId)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [currentPage, currentScanlatorId, scrollTargetId]);

    const currentChapters = sortedChapters.slice(
        (currentPage - 1) * CHAPTERS_PER_PAGE,
        currentPage * CHAPTERS_PER_PAGE,
    );

    const firstChapterNumber = useMemo(() => {
        if (chapters.length === 0) return 1;
        return Math.min(...chapters.map((chapter) => chapter.number));
    }, [chapters]);

    const scanlatorOptions = useMemo(() => {
        const seen = new Set<number>();
        return rawChapters.scanlators.flatMap((scanlator) => {
            if (seen.has(scanlator.id)) return [];
            seen.add(scanlator.id);
            return [{ value: scanlator.id, label: scanlator.name }];
        });
    }, [rawChapters.scanlators]);

    const scanlatorNameById = useMemo(
        () =>
            new Map(
                rawChapters.scanlators.map((scanlator) => [
                    scanlator.id,
                    scanlator.name,
                ]),
            ),
        [rawChapters.scanlators],
    );

    const navigateToLastRead = () => {
        if (!lastReadChapterId) {
            toastManager.add({
                title: "No previous reading history found",
                type: "error",
            });
            return;
        }

        const chapterIndex = sortedChapters.findIndex(
            (chapter) => chapter.id === lastReadChapterId,
        );
        if (chapterIndex === -1) {
            toastManager.add({
                title: `Last read chapter (${lastReadChapterId}) not found`,
                type: "error",
            });
            return;
        }

        setCurrentPage(Math.floor(chapterIndex / CHAPTERS_PER_PAGE) + 1);
        setScrollTargetId(lastReadChapterId);
    };

    return (
        <Tabs
            swipeable
            value={activeTab}
            onValueChange={(value: MangaDetailsTab) => {
                if (value === "recommendations") {
                    setHasOpenedRecommendations(true);
                }
                if (value === "relationships") {
                    setHasOpenedRelationships(true);
                }
                setActiveTab(value);
            }}
            className="w-full p-0"
        >
            <div className="flex flex-col xl:flex-row gap-1 lg:gap-2">
                <ScrollArea className="h-10 -mb-1">
                    <TabsList
                        className="bg-background py-0 gap-2 lg:w-fit h-9"
                        variant="underline"
                    >
                        <TabsTrigger
                            className="text-xl lg:text-2xl font-bold"
                            value="chapters"
                        >
                            Chapters
                        </TabsTrigger>
                        <TabsTrigger
                            className="text-xl lg:text-2xl font-bold"
                            value="recommendations"
                        >
                            Recommendations
                        </TabsTrigger>
                        <TabsTrigger
                            className="text-xl lg:text-2xl font-bold"
                            value="relationships"
                        >
                            Relationships
                        </TabsTrigger>
                    </TabsList>
                </ScrollArea>
                <ChaptersControls
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    scanlatorId={currentScanlatorId}
                    onScanlatorChange={setCurrentScanlatorId}
                    scanlatorOptions={scanlatorOptions}
                >
                    {lastReadData ? (
                        <Button
                            onClick={navigateToLastRead}
                            className="flex-1 lg:w-40 sm:h-9"
                            disabled={!user}
                            loading={isLastReadLoading || isUserLoading}
                        >
                            Find Latest Read
                        </Button>
                    ) : (
                        <ButtonLink
                            to="/manga/$mangaId/$scanlator/$subId"
                            params={
                                chapterParams(
                                    mangaId,
                                    currentScanlatorId,
                                    firstChapterNumber,
                                ) as never
                            }
                            className="lg:flex-1 lg:w-40 sm:h-9"
                        >
                            Go to First Chapter
                        </ButtonLink>
                    )}
                </ChaptersControls>
            </div>

            <TabsContent value="chapters" keepMounted>
                <ChaptersJsonLd chapters={rawChapters} mangaId={mangaId} />
                <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                    {currentChapters.map((chapter) => (
                        <ChapterCard
                            key={chapter.id}
                            mangaId={mangaId}
                            chapter={chapter}
                            lastReadId={lastReadChapterId}
                            isCurrentScanlator={
                                chapter.scanlatorId === currentScanlatorId
                            }
                            scanlatorName={scanlatorNameById.get(
                                chapter.scanlatorId,
                            )}
                        />
                    ))}
                </div>
            </TabsContent>

            <TabsContent
                value="recommendations"
                keepMounted={hasOpenedRecommendations}
            >
                <MangaRecommendations id={mangaId} />
            </TabsContent>

            <TabsContent
                value="relationships"
                keepMounted={hasOpenedRelationships}
            >
                <MangaRelationships id={mangaId} />
            </TabsContent>
        </Tabs>
    );
}
