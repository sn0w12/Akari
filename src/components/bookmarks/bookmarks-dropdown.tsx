import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface BookmarksDropdownProps {
    exportBookmarks: () => Promise<void>;
    syncToMal: () => Promise<null | undefined>;
}

export function BookmarksDropdown({
    exportBookmarks,
    syncToMal,
}: BookmarksDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="flex size-10 md:hidden"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportBookmarks}>
                    Export Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={syncToMal}
                    className="bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 text-white focus:bg-blue-600 focus:text-white"
                >
                    Sync to MAL
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
