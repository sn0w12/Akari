import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface BookmarksDropdownProps {
    exportBookmarks: () => Promise<void>;
}

export function BookmarksDropdown({ exportBookmarks }: BookmarksDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="outline"
                        size="icon"
                        className="flex size-9 md:hidden"
                    />
                }
            >
                <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportBookmarks}>
                    Export Bookmarks
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
