import { Suspense } from "react";
import { GridBodySkeleton } from "../grid-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChaptersSectionServer } from "./chapters";
import { MangaRecommendations } from "./recommended";

export function MangaDetailsBody({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <Tabs defaultValue="chapters" className="w-full">
            <TabsList className="bg-background p-0 gap-2">
                <TabsTrigger
                    className="text-xl md:text-2xl font-bold px-0 border-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                    value="chapters"
                >
                    Chapters
                </TabsTrigger>
                <TabsTrigger
                    className="text-xl md:text-2xl font-bold px-0 border-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background dark:data-[state=active]:bg-background"
                    value="recommendations"
                >
                    Recommendations
                </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
                <ChaptersSectionServer params={params} />
            </TabsContent>

            <TabsContent value="recommendations" className="mb-2">
                <Suspense fallback={<GridBodySkeleton pageSize={12} />}>
                    <MangaRecommendations params={params} />
                </Suspense>
            </TabsContent>
        </Tabs>
    );
}
