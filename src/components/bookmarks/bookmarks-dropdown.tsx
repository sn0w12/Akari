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
}

export function BookmarksDropdown({ exportBookmarks }: BookmarksDropdownProps) {
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
