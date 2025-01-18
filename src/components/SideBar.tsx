"use client";

import {
    Menu,
    Search,
    List,
    Home,
    TrendingUp,
    LampDesk,
    Bookmark,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import { GENRE_CATEGORIES } from "@/lib/search";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import SettingsDialog from "./ui/Header/SettingsDialog";
import LoginDialog from "./ui/Header/AccountDialog";

function SideBarLink({
    href,
    text,
    icon,
}: {
    href: string;
    text: string;
    icon: any;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-3 border rounded-lg hover:bg-accent/50 transition-colors duration-200"
        >
            {icon}
            <span className="text-base font-medium">{text}</span>
        </Link>
    );
}

export function SideBar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent transition-colors duration-200"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                id="sidebar"
                side="right"
                className="p-0 w-11/12 sm:w-96 border-l"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <LampDesk className="h-6 w-6" />
                            Akari
                        </SheetTitle>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-2">
                            <SideBarLink
                                href="/"
                                text="Home"
                                icon={<Home className="h-5 w-5" />}
                            />
                            <SideBarLink
                                href="/bookmarks"
                                text="Bookmarks"
                                icon={<Bookmark className="h-5 w-5" />}
                            />
                            <SideBarLink
                                href="/search"
                                text="Advanced Search"
                                icon={<Search className="h-5 w-5" />}
                            />
                            <Accordion type="multiple" className="w-full">
                                <AccordionItem
                                    value="genres"
                                    className="border rounded-lg"
                                >
                                    <AccordionTrigger className="px-3 py-3 hover:bg-accent/50 transition-colors duration-200">
                                        <div className="flex items-center gap-3">
                                            <List className="h-5 w-5" />
                                            <span className="text-base font-medium">
                                                Genres
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-0">
                                        <Accordion
                                            type="multiple"
                                            className="w-full"
                                        >
                                            {Object.entries(
                                                GENRE_CATEGORIES,
                                            ).map(([category, genres]) => (
                                                <AccordionItem
                                                    value={category}
                                                    key={category}
                                                    className={`border-b-0 border-t`}
                                                >
                                                    <AccordionTrigger className="px-3 py-3 hover:bg-accent/50 transition-colors duration-200">
                                                        <span className="text-md font-medium">
                                                            {category}
                                                        </span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-0">
                                                        <div className="space-y-1 px-3 pt-1 pb-2">
                                                            {genres.map(
                                                                (genre) => (
                                                                    <Link
                                                                        key={
                                                                            genre
                                                                        }
                                                                        href={`/genre/${genre}`}
                                                                        className="block px-4 py-2 hover:bg-accent rounded-md border text-sm transition-colors duration-200"
                                                                    >
                                                                        {genre}
                                                                    </Link>
                                                                ),
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <SideBarLink
                                href="/popular"
                                text="Popular Manga"
                                icon={<TrendingUp className="h-5 w-5" />}
                            />
                        </div>
                    </ScrollArea>

                    {/* Settings */}
                    <div className="border-t p-4 flex flex-col sm:flex-row justify-center gap-2">
                        <SettingsDialog />
                        <LoginDialog />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
