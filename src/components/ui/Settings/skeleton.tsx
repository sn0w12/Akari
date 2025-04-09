import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDefaultSettingsMaps, renderInputSkeleton } from "@/lib/settings";

export default async function SettingsSkeleton() {
    const settingsMap = getDefaultSettingsMaps();

    return (
        <div className="bg-background rounded-lg border shadow">
            <Tabs value={Object.keys(settingsMap)[0]} className="w-full">
                <div className="border-b px-4">
                    <TabsList className="flex flex-wrap h-auto gap-2 w-full justify-center md:justify-start py-2 bg-transparent">
                        {Object.keys(settingsMap).map((category) => (
                            <TabsTrigger
                                key={category}
                                value={category}
                                className="data-[state=active]:bg-accent rounded-md px-3 py-1.5 hover:bg-accent/70 flex-shrink-0"
                            >
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="p-6">
                    {Object.entries(settingsMap).map(
                        ([category, categorySettings]) => (
                            <TabsContent
                                key={category}
                                value={category}
                                className="mt-0"
                            >
                                <div className="space-y-6">
                                    {Object.entries(categorySettings).map(
                                        ([key, setting]) => (
                                            <div
                                                key={key}
                                                className="border-b pb-4 last:border-b-0 last:pb-0"
                                            >
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <Label
                                                                htmlFor={key}
                                                                className="text-sm font-medium"
                                                            >
                                                                {setting.label}
                                                            </Label>
                                                            {setting.description && (
                                                                <p
                                                                    className="text-sm text-muted-foreground settings-description"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: setting.description,
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            {renderInputSkeleton(
                                                                setting,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </TabsContent>
                        ),
                    )}
                </div>
            </Tabs>
        </div>
    );
}
