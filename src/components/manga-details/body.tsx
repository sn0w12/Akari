import { cn } from "@/lib/utils";
import type { components } from "@/types/api";
import { Suspense, useState } from "react";
import { GridBodySkeleton } from "../grid-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersSectionServer } from "./chapters";
import { MangaRecommendations } from "./recommended";

type MangaDetailsTab = "chapters" | "recommendations";

export function MangaDetailsBody({
    chapters,
    mangaId,
}: {
    chapters: components["schemas"]["MangaChapterResponse"];
    mangaId: string;
}) {
    const [activeTab, setActiveTab] = useState<MangaDetailsTab>("chapters");
    const [hasOpenedRecommendations, setHasOpenedRecommendations] =
        useState(false);

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => {
                if (value !== "chapters" && value !== "recommendations") {
                    return;
                }
                if (value === "recommendations") {
                    setHasOpenedRecommendations(true);
                }
                setActiveTab(value);
            }}
            className="w-full p-0"
        >
            <TabsList
                className={cn("bg-background py-0 gap-2 w-full md:w-fit", {
                    "mb-1": activeTab === "chapters",
                    "mb-0": activeTab === "recommendations",
                })}
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

            <TabsContent value="chapters" keepMounted>
                <ChaptersSectionServer chapters={chapters} mangaId={mangaId} />
            </TabsContent>

            <TabsContent
                value="recommendations"
                keepMounted={hasOpenedRecommendations}
            >
                <Suspense fallback={<GridBodySkeleton pageSize={12} />}>
                    <MangaRecommendations id={mangaId} />
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}
