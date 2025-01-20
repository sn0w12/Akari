"use client";

import {
    Menu,
    Search,
    List,
    Home,
    TrendingUp,
    LampDesk,
    Bookmark,
    User,
    Settings,
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
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "./ui/context-menu";
import SettingsDialog from "./ui/Header/SettingsDialog";
import LoginDialog from "./ui/Header/AccountDialog";
import { useRef } from "react";

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
    const sheetRef = useRef<any>(null);
    const loginRef = useRef<any>(null);
    const settingsRef = useRef<any>(null);

    const handleAccountClick = () => {
        sheetRef.current?.click();
        setTimeout(() => {
            loginRef.current?.click();
        }, 300);
    };

    const handleSettingsClick = () => {
        sheetRef.current?.click();
        setTimeout(() => {
            settingsRef.current?.click();
        }, 300);
    };

    return (
        <Sheet>
            <ContextMenu>
                <ContextMenuTrigger>
                    <SheetTrigger asChild>
                        <Button
                            ref={sheetRef}
                            variant="ghost"
                            size="icon"
                            className="hover:bg-accent transition-colors duration-200 select-none touch-none"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                </ContextMenuTrigger>

                {/* Context Menu */}
                <ContextMenuContent>
                    <Link href="/">
                        <ContextMenuItem className="cursor-pointer">
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </ContextMenuItem>
                    </Link>
                    <Link href="/bookmarks">
                        <ContextMenuItem className="cursor-pointer">
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmarks
                        </ContextMenuItem>
                    </Link>
                    <Link href="/search">
                        <ContextMenuItem className="cursor-pointer">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </ContextMenuItem>
                    </Link>

                    {/* Categories */}
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <List className="mr-2 h-4 w-4" />
                            Categories
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                            {Object.entries(GENRE_CATEGORIES).map(
                                ([category, genres]) => (
                                    <ContextMenuSub key={category}>
                                        <ContextMenuSubTrigger inset>
                                            {category}
                                        </ContextMenuSubTrigger>
                                        <ContextMenuSubContent>
                                            {genres.map((genre) => (
                                                <Link
                                                    key={genre}
                                                    href={`/genre/${genre}`}
                                                >
                                                    <ContextMenuItem className="cursor-pointer">
                                                        {genre}
                                                    </ContextMenuItem>
                                                </Link>
                                            ))}
                                        </ContextMenuSubContent>
                                    </ContextMenuSub>
                                ),
                            )}
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <Link href="/popular">
                        <ContextMenuItem className="cursor-pointer">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Popular
                        </ContextMenuItem>
                    </Link>

                    <ContextMenuSeparator />

                    <ContextMenuItem onClick={handleAccountClick}>
                        <User className="mr-2 h-4 w-4" />
                        Account
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleSettingsClick}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </ContextMenuItem>
                </ContextMenuContent>

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
                                                                            {
                                                                                genre
                                                                            }
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
                            <SettingsDialog ref={settingsRef} />
                            <LoginDialog ref={loginRef} />
                        </div>
                    </div>
                </SheetContent>
            </ContextMenu>
        </Sheet>
    );
}
