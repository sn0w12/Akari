"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Flag, Edit, Trash } from "lucide-react";
import { useUser } from "@/contexts/user-context";

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
    const { user } = useUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    disabled={commentDeleted || showReplyForm || isEditing}
                >
                    <MoreVertical className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem
                    onClick={onReport}
                    disabled={commentDeleted || !user}
                >
                    <Flag className="h-3 w-3" />
                    <span>Report</span>
                </DropdownMenuItem>
                {isOwner && !commentDeleted && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onEdit}
                            disabled={showReplyForm}
                        >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            disabled={showReplyForm}
                            variant="destructive"
                        >
                            <Trash className="h-3 w-3" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
