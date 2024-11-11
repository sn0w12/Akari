import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import LoginDialog from "./ui/Header/AccountDialog";
import Icon from "./ui/Header/Icon";
import SettingsDialog from "./ui/Header/SettingsDialog";
import ThemeToggle from "./ui/Header/ThemeToggle";
import SearchBar from "./ui/Header/Search/SearchBar";
import SearchButton from "./ui/Header/Search/SearchButton";
import { getProductionUrl } from "@/app/api/baseUrl";
import { headers } from "next/headers";

async function fetchNotification() {
    try {
        const res = await fetch(
            `${getProductionUrl()}/api/bookmarks/notification`,
            {
                headers: await headers(),
            },
        );

        if (!res.ok) {
            return "";
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching search results:", error);
        return "";
    }
}

export async function HeaderComponent() {
    let notification = "";
    try {
        notification = await fetchNotification();
    } catch (error) {
        console.error("Error fetching notification:", error);
    }

    return (
        <header className="sticky top-0 z-50 bg-background border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold title">
                    <Icon />
                </Link>

                <div className="flex items-center space-x-4 flex-grow justify-end">
                    <SearchBar />
                    <div className="flex gap-4">
                        <SearchButton />
                        <Link
                            href="/bookmarks"
                            className={
                                !notification ? "pointer-events-none" : ""
                            }
                        >
                            <div className="relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="group-hover:bg-accent"
                                    disabled={!notification}
                                >
                                    <Bookmark className="h-5 w-5" />
                                </Button>
                                {/* Badge element */}
                                {notification && (
                                    <span
                                        className="absolute bg-red-500 text-white text-xs font-bold rounded-full px-2 h-5 flex items-center justify-center transform translate-x-1/4 translate-y-1/4"
                                        style={{ bottom: "0", right: "0" }}
                                    >
                                        {notification}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Account Information Dialog */}
                        <LoginDialog />

                        {/* Settings Dialog */}
                        <SettingsDialog />

                        {/* Theme Toggle Button */}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
