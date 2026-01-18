"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Info } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { InfoContent } from "./info";
import { SettingsContent } from "./settings";

export function InfoDrawer({
    chapter,
}: {
    chapter: components["schemas"]["ChapterResponse"];
}) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="h-7.5">
                    <Info className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div
                    className="overflow-y-auto p-2 pt-0 mt-4"
                    style={{ maxHeight: "calc(100vh - 10rem)" }}
                >
                    <InfoContent chapter={chapter} />
                    <Separator className="my-4" />
                    <SettingsContent />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
