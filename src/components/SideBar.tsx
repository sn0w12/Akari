"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GENRE_CATEGORIES } from "@/lib/search";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import SettingsDialog from "@/components/ui/Header/SettingsDialog";
import LoginDialog from "@/components/ui/Header/AccountDialog";
import { useShortcut } from "@/lib/shortcuts";
import { KeyboardShortcut } from "./ui/Shortcuts/KeyboardShortcuts";
import { getSettings, useSettingsChange } from "@/lib/settings";

function SideBarLink({
    href,
    text,
    icon: Icon,
    onClose,
}: {
    href: string;
    text: string;
    icon: React.ElementType;
    onClose: () => void;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            onClick={onClose}
        >
            <Icon className="h-5 w-5" />
            <span className="text-base font-medium">{text}</span>
        </Link>
    );
}

export function SideBar() {
    const [open, setOpen] = useState(false);
    type ShortcutSettings = {
        toggleSidebar: string | null;
        openSettings: string | null;
        openAccount: string | null;
        navigateBookmarks: string | null;
    };
    const [shortcuts, setShortcuts] = useState<ShortcutSettings>({
        toggleSidebar: null,
        openSettings: null,
        openAccount: null,
        navigateBookmarks: null,
    });
    const router = useRouter();
    const sheetRef = useRef<HTMLButtonElement>(null);
    const loginRef = useRef<HTMLButtonElement>(null);
    const settingsRef = useRef<HTMLButtonElement>(null);

    // Get shortcut settings
    useEffect(() => {
        const settings = getSettings([
            "toggleSidebar",
            "openSettings",
            "openAccount",
            "navigateBookmarks",
        ]);
        setShortcuts(
            (settings as ShortcutSettings) ?? {
                toggleSidebar: null,
                openSettings: null,
                openAccount: null,
                navigateBookmarks: null,
            },
        );
    }, []);

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

    const handleClose = () => {
        setOpen(false);
    };

    useShortcut(shortcuts.toggleSidebar || "", () => setOpen((prev) => !prev), {
        preventDefault: true,
    });
    useShortcut(shortcuts.openSettings || "", handleSettingsClick, {
        preventDefault: true,
    });
    useShortcut(shortcuts.openAccount || "", handleAccountClick, {
        preventDefault: true,
    });
    useShortcut(
        shortcuts.navigateBookmarks || "",
        () => {
            router.push("/bookmarks");
            setOpen(false);
        },
        { preventDefault: true },
    );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <ContextMenu>
                <ContextMenuTrigger>
                    <SheetTrigger asChild>
                        <Button
                            ref={sheetRef}
                            variant="ghost"
                            size="icon"
                            className="hover:bg-accent transition-colors duration-200 select-none touch-none border"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-56">
                    <ContextMenuItem onSelect={() => setOpen((prev) => !prev)}>
                        <Menu className="mr-2 h-4 w-4" />
                        <span>Open</span>
                        {shortcuts.toggleSidebar && (
                            <KeyboardShortcut
                                keys={shortcuts.toggleSidebar.split("+")}
                            />
                        )}
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem asChild>
                        <Link href="/" className="flex items-center">
                            <Home className="mr-2 h-4 w-4" />
                            <span>Home</span>
                        </Link>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                        <Link href="/bookmarks" className="flex items-center">
                            <Bookmark className="mr-2 h-4 w-4" />
                            <span>Bookmarks</span>
                            {shortcuts.navigateBookmarks && (
                                <KeyboardShortcut
                                    keys={shortcuts.navigateBookmarks.split(
                                        "+",
                                    )}
                                />
                            )}
                        </Link>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                        <Link href="/search" className="flex items-center">
                            <Search className="mr-2 h-4 w-4" />
                            <span>Search</span>
                        </Link>
                    </ContextMenuItem>
                    <ContextMenuItem asChild>
                        <Link href="/popular" className="flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span>Popular</span>
                        </Link>
                    </ContextMenuItem>

                    <ContextMenuSub>
                        <ContextMenuSubTrigger className="flex items-center">
                            <List className="mr-2 h-4 w-4" />
                            <span>Categories</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                            {Object.entries(GENRE_CATEGORIES).map(
                                ([category, genres]) => (
                                    <ContextMenuSub key={category}>
                                        <ContextMenuSubTrigger>
                                            {category}
                                        </ContextMenuSubTrigger>
                                        <ContextMenuSubContent className="w-48">
                                            {genres.map((genre) => (
                                                <ContextMenuItem
                                                    key={genre}
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/genre/${genre}`}
                                                    >
                                                        {genre}
                                                    </Link>
                                                </ContextMenuItem>
                                            ))}
                                        </ContextMenuSubContent>
                                    </ContextMenuSub>
                                ),
                            )}
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    <ContextMenuItem onSelect={handleAccountClick}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Account</span>
                        {shortcuts.openAccount && (
                            <KeyboardShortcut
                                keys={shortcuts.openAccount.split("+")}
                            />
                        )}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={handleSettingsClick}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        {shortcuts.openSettings && (
                            <KeyboardShortcut
                                keys={shortcuts.openSettings.split("+")}
                            />
                        )}
                    </ContextMenuItem>
                </ContextMenuContent>

                <SheetContent
                    side="right"
                    className="p-0 w-11/12 sm:w-96 border-l"
                >
                    <div id="sidebar" className="flex flex-col h-full">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2 p-6 border-b">
                            <LampDesk className="h-6 w-6" />
                            <span>Akari</span>
                        </SheetTitle>

                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-4 py-6">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold tracking-tight mb-2">
                                        Navigation
                                    </h2>
                                    <SideBarLink
                                        href="/"
                                        text="Home"
                                        icon={Home}
                                        onClose={handleClose}
                                    />
                                    <SideBarLink
                                        href="/bookmarks"
                                        text="Bookmarks"
                                        icon={Bookmark}
                                        onClose={handleClose}
                                    />
                                    <SideBarLink
                                        href="/search"
                                        text="Advanced Search"
                                        icon={Search}
                                        onClose={handleClose}
                                    />
                                    <SideBarLink
                                        href="/popular"
                                        text="Popular Manga"
                                        icon={TrendingUp}
                                        onClose={handleClose}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold tracking-tight mb-2">
                                        Genres
                                    </h2>
                                    <Accordion
                                        type="multiple"
                                        className="w-full space-y-2"
                                    >
                                        {Object.entries(GENRE_CATEGORIES).map(
                                            ([category, genres]) => (
                                                <AccordionItem
                                                    key={category}
                                                    value={category}
                                                    className="border rounded-md"
                                                >
                                                    <AccordionTrigger className="px-4 py-2 hover:bg-accent transition-colors text-base font-medium">
                                                        {category}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-1 px-2">
                                                        <div className="space-y-1">
                                                            {genres.map(
                                                                (genre) => (
                                                                    <Link
                                                                        key={
                                                                            genre
                                                                        }
                                                                        href={`/genre/${genre}`}
                                                                        onClick={
                                                                            handleClose
                                                                        }
                                                                        className="block px-4 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                                                    >
                                                                        {genre}
                                                                    </Link>
                                                                ),
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ),
                                        )}
                                    </Accordion>
                                </div>
                            </div>
                        </ScrollArea>

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
