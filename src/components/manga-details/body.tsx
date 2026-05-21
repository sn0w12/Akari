import type { components } from "@/types/api";
import { Suspense } from "react";
import { GridBodySkeleton } from "../grid-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersSectionServer } from "./chapters";
import { MangaRecommendations } from "./recommended";

export function MangaDetailsBody({
    chapters,
    mangaId,
}: {
    chapters: components["schemas"]["MangaChapterResponse"];
    mangaId: string;
}) {
    return (
        <Tabs defaultValue="chapters" className="w-full p-0">
            <TabsList
                className="bg-background py-0 mb-1 gap-2 "
                variant="underline"
            >
                <TabsTrigger
                    className="text-xl md:text-2xl font-bold"
                    value="chapters"
                >
                    Chapters
                </TabsTrigger>
                <TabsTrigger
                    className="text-xl md:text-2xl font-bold"
                    value="recommendations"
                >
                    Recommendations
                </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
                <ChaptersSectionServer chapters={chapters} mangaId={mangaId} />
            </TabsContent>

            <TabsContent value="recommendations" className="mb-2">
                <Suspense fallback={<GridBodySkeleton pageSize={12} />}>
                    <MangaRecommendations id={mangaId} />
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}
