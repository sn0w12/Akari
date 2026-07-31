import { cn } from "@/lib/utils";
import type { components } from "@/types/api";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersSectionServer } from "./tabs/chapters";
import { MangaRecommendations } from "./tabs/recommended";
import { MangaRelationships } from "./tabs/relationships";
import { ScrollArea } from "../ui/scroll-area";

type MangaDetailsTab = "chapters" | "recommendations" | "relationships";

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
    const [hasOpenedRelationships, setHasOpenedRelationships] = useState(false);

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
            <ScrollArea className="h-9">
                <TabsList
                    className={cn("bg-background py-0 gap-2 lg:w-fit h-9", {
                        "lg:mb-1": activeTab === "chapters",
                        "mb-0":
                            activeTab === "recommendations" || "relationships",
                    })}
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

            <TabsContent value="chapters" keepMounted>
                <ChaptersSectionServer chapters={chapters} mangaId={mangaId} />
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
