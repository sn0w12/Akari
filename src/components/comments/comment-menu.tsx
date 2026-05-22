import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { Edit, Flag, MoreVertical, Trash } from "lucide-react";

interface CommentMenuProps {
    onReport: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwner: boolean;
    commentDeleted: boolean;
    showReplyForm: boolean;
    isEditing: boolean;
}

export function CommentMenu({
    onReport,
    onEdit,
    onDelete,
    isOwner,
    commentDeleted,
    showReplyForm,
    isEditing,
}: CommentMenuProps) {
    const { data: user } = useUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        disabled={commentDeleted || showReplyForm || isEditing}
                        aria-label="Comment Menu"
                    />
                }
            >
                <MoreVertical className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {!isOwner && (
                    <DropdownMenuItem
                        onClick={onReport}
                        disabled={commentDeleted || !user || user.banned}
                    >
                        <Flag className="size-3" />
                        <span>Report</span>
                    </DropdownMenuItem>
                )}
                {isOwner && !commentDeleted && (
                    <>
                        <DropdownMenuItem
                            onClick={onEdit}
                            disabled={showReplyForm || !user || user.banned}
                        >
                            <Edit className="size-3" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            disabled={showReplyForm || !user || user.banned}
                            variant="destructive"
                        >
                            <Trash className="size-3" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
