"use client";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentMenu } from "@/components/comments/comment-menu";
import { ReportCommentDialog } from "@/components/comments/report";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/contexts/confirm-context";
import { cn, generateSizes } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    MessageSquare,
    MessageSquareReply,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";

export type CommentData =
    | components["schemas"]["CommentWithRepliesResponse"]
    | components["schemas"]["CommentResponse"];
export type VoteType = "up" | "down" | "unset";

interface CommentProps {
    comment: CommentData;
    onLoadReplies?: (commentId: string) => Promise<void>;
    onVote?: (commentId: string, voteType: VoteType) => Promise<void>;
    onReply?: (
        parentId: string,
        content: string,
        attachment?: components["schemas"]["UploadResponse"],
    ) => Promise<CommentData>;
    onEdit?: (commentId: string, content: string) => Promise<void>;
    onDelete?: (commentId: string) => Promise<void>;
    depth?: number;
    userVotes?: components["schemas"]["CommentVoteResponse"][];
    currentUser?: components["schemas"]["UserResponse"];
}

export function Comment({
    comment,
    onLoadReplies,
    onVote,
    onReply,
    onEdit,
    onDelete,
    depth = 0,
    userVotes = [],
    currentUser,
}: CommentProps) {
    const { confirm } = useConfirm();

    const [showReplies, setShowReplies] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReportDialog, setShowReportDialog] = useState(false);

    const initialVote = userVotes.find((v) => v.commentId === comment.id);
    const [userVote, setUserVote] = useState<VoteType | null>(null);
    const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes);
    const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes);
    const isBanned = currentUser?.banned;

    useEffect(() => {
        setUserVote(
            initialVote ? (initialVote.value === 1 ? "up" : "down") : null,
        );
    }, [initialVote]);

    useEffect(() => {
        setLocalUpvotes(comment.upvotes);
        setLocalDownvotes(comment.downvotes);
    }, [comment.upvotes, comment.downvotes]);

    const hasReplies =
        ("replyCount" in comment && (comment.replyCount ?? 0) > 0) ||
        ("replies" in comment && comment.replies && comment.replies.length > 0);

    const replyCount =
        "replyCount" in comment
            ? (comment.replyCount ?? 0)
            : Array.isArray(comment.replies)
              ? comment.replies.length
              : 0;

    const handleShowReplies = async () => {
        if (
            !showReplies &&
            onLoadReplies &&
            "replies" in comment &&
            (!comment.replies || comment.replies.length === 0) &&
            depth === 0
        ) {
            setIsLoadingReplies(true);
            try {
                await onLoadReplies(comment.id);
            } finally {
                setIsLoadingReplies(false);
            }
        }
        setShowReplies(!showReplies);
    };

    const handleVote = async (voteType: VoteType) => {
        if (!onVote) return;

        const previousVote = userVote;
        const previousUpvotes = localUpvotes;
        const previousDownvotes = localDownvotes;

        let action: VoteType = voteType;

        // Optimistic update
        if (userVote === voteType) {
            // Remove vote
            setUserVote(null);
            if (voteType === "up") {
                setLocalUpvotes((prev) => prev - 1);
            } else {
                setLocalDownvotes((prev) => prev - 1);
            }
            action = "unset";
        } else {
            // Add or change vote
            if (userVote === "up") {
                setLocalUpvotes((prev) => prev - 1);
            } else if (userVote === "down") {
                setLocalDownvotes((prev) => prev - 1);
            }

            setUserVote(voteType);
            if (voteType === "up") {
                setLocalUpvotes((prev) => prev + 1);
            } else {
                setLocalDownvotes((prev) => prev + 1);
            }
        }

        try {
            await onVote(comment.id, action);
        } catch (error) {
            console.error("Failed to vote:", error);
            // Revert on error
            setUserVote(previousVote);
            setLocalUpvotes(previousUpvotes);
            setLocalDownvotes(previousDownvotes);
        }
    };

    const handleReplySubmit = async (
        content: string,
        attachment?: components["schemas"]["UploadResponse"],
    ) => {
        if (!onReply) return;
        try {
            await onReply(comment.id, content, attachment);
            setShowReplyForm(false);
            // If replies aren't shown yet, show them after posting
            if (!showReplies && hasReplies) {
                handleShowReplies();
            }
        } catch (error) {
            console.error("Failed to post reply:", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800)
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const displayReplies =
        "replies" in comment && Array.isArray(comment.replies)
            ? comment.replies
            : [];

    return (
        <div
            className={cn(
                "flex gap-2 sm:gap-3",
                depth > 0 && "ml-4 sm:ml-8 mt-3 sm:mt-4",
            )}
        >
            <Avatar name={comment.userProfile.username} />
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1 text-xs sm:text-sm">
                    <Link
                        href={`/user/${comment.userProfile.id}`}
                        className="font-medium text-foreground hover:underline"
                    >
                        {comment.userProfile.displayName}
                    </Link>
                    <span className="text-muted-foreground truncate">
                        @{comment.userProfile.username}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                        •
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                        {formatDate(comment.createdAt)}
                    </span>
                    {comment.edited && (
                        <>
                            <span className="text-muted-foreground hidden sm:inline">
                                •
                            </span>
                            <span className="text-muted-foreground text-xs">
                                edited
                            </span>
                        </>
                    )}

                    <CommentMenu
                        onReport={() => setShowReportDialog(true)}
                        onEdit={() => setIsEditing(true)}
                        onDelete={
                            onDelete
                                ? async () => {
                                      if (
                                          await confirm({
                                              title: "Are you sure you want to delete this comment?",
                                              description:
                                                  "This action cannot be undone. The comment will be permanently deleted.",
                                              variant: "destructive",
                                          })
                                      ) {
                                          await onDelete(comment.id);
                                      }
                                  }
                                : undefined
                        }
                        isOwner={
                            currentUser
                                ? comment.userProfile.id === currentUser.userId
                                : false
                        }
                        commentDeleted={comment.deleted}
                        showReplyForm={showReplyForm}
                        isEditing={isEditing}
                    />
                </div>

                {isEditing ? (
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit your comment..."
                        className="min-h-[80px] text-sm sm:text-base mb-1"
                    />
                ) : (
                    <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">
                        {comment.content}
                    </p>
                )}

                {comment.attachment && (
                    <div className="mt-2 mb-2">
                        <Image
                            src={comment.attachment.url}
                            alt="Comment attachment"
                            className="max-w-64 h-auto rounded-md border"
                            height={160}
                            width={160}
                            sizes={generateSizes({
                                default: "256px",
                            })}
                        />
                    </div>
                )}

                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 w-8 sm:h-7 sm:w-7 p-0 hover:bg-accent",
                                userVote === "up" &&
                                    "bg-primary/10 text-primary hover:bg-primary/20",
                            )}
                            onClick={() => handleVote("up")}
                            disabled={comment.deleted || isBanned}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground px-1 sm:px-1.5 min-w-[20px] sm:min-w-[24px] text-center">
                            {localUpvotes - localDownvotes}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 w-8 sm:h-7 sm:w-7 p-0 hover:bg-accent",
                                userVote === "down" &&
                                    "bg-destructive/10 text-destructive hover:bg-destructive/20",
                            )}
                            onClick={() => handleVote("down")}
                            disabled={comment.deleted || isBanned}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>

                    {isEditing ? (
                        <ButtonGroup orientation="horizontal">
                            <Button
                                onClick={async () => {
                                    if (!onEdit) return;
                                    try {
                                        await onEdit(comment.id, editContent);
                                        setIsEditing(false);
                                    } catch (error) {
                                        console.error(
                                            "Failed to edit comment:",
                                            error,
                                        );
                                    }
                                }}
                                size="sm"
                                className="h-8 sm:h-7 px-2 text-xs"
                            >
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                size="sm"
                                className="h-8 sm:h-7 px-2 text-xs"
                            >
                                Cancel
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <ButtonGroup orientation="horizontal">
                            {hasReplies && (
                                <>
                                    <Button
                                        onClick={handleShowReplies}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 sm:h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <MessageSquare className="h-3 w-3" />
                                        <span className="sr-only sm:not-sr-only">
                                            {isLoadingReplies
                                                ? "Loading..."
                                                : showReplies
                                                  ? "Hide replies"
                                                  : `Show ${replyCount} ${
                                                        replyCount === 1
                                                            ? "reply"
                                                            : "replies"
                                                    }`}
                                        </span>
                                    </Button>
                                    {currentUser && <ButtonGroupSeparator />}
                                </>
                            )}
                            {currentUser && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-8 sm:h-7 px-2 text-xs text-muted-foreground hover:text-foreground",
                                        showReplyForm &&
                                            "bg-primary/10 text-primary hover:bg-primary/20",
                                    )}
                                    onClick={() =>
                                        setShowReplyForm(!showReplyForm)
                                    }
                                    disabled={comment.deleted || isBanned}
                                >
                                    <MessageSquareReply className="h-3 w-3" />
                                    <span className="sr-only sm:not-sr-only">
                                        Reply
                                    </span>
                                </Button>
                            )}
                        </ButtonGroup>
                    )}
                </div>

                {showReplyForm && !isEditing && (
                    <div className="mt-3">
                        <CommentForm
                            onSubmit={handleReplySubmit}
                            placeholder={`Reply to ${comment.userProfile.displayName}...`}
                            submitLabel="Reply"
                            onCancel={() => setShowReplyForm(false)}
                            autoFocus
                            currentUser={currentUser}
                        />
                    </div>
                )}

                {showReplies && displayReplies.length > 0 && (
                    <div className="space-y-4 mt-4">
                        {displayReplies.map((reply) => (
                            <Comment
                                key={reply.id}
                                comment={reply}
                                onLoadReplies={onLoadReplies}
                                onVote={onVote}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                depth={depth + 1}
                                userVotes={userVotes}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ReportCommentDialog
                commentId={comment.id}
                isOpen={showReportDialog}
                onOpenChange={setShowReportDialog}
            />
        </div>
    );
}
