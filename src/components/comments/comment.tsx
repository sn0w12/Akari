import { CommentForm } from "@/components/comments/comment-form";
import { CommentMenu } from "@/components/comments/comment-menu";
import { ReportCommentDialog } from "@/components/comments/report";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/contexts/confirm-context";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, MessageSquare, MessageSquareReply } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { ButtonGroup } from "../ui/group";
import { CommentAttachment } from "./attachment";

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

const EMPTY_USER_VOTES: components["schemas"]["CommentVoteResponse"][] = [];

export function Comment({
  comment,
  onLoadReplies,
  onVote,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
  userVotes = EMPTY_USER_VOTES,
  currentUser,
}: CommentProps) {
  const { confirm } = useConfirm();
  const [editContent, setEditContent] = useState(comment.content);

  type UIState = {
    showReplies: boolean;
    isLoadingReplies: boolean;
    showReplyForm: boolean;
    isEditing: boolean;
    showReportDialog: boolean;
  };

  type UIAction =
    | { type: "TOGGLE_REPLIES" }
    | { type: "SET_LOADING_REPLIES"; loading: boolean }
    | { type: "SET_REPLY_FORM"; open: boolean }
    | { type: "SET_EDITING"; editing: boolean }
    | { type: "SET_REPORT"; open: boolean };

  function uiReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
      case "TOGGLE_REPLIES":
        return { ...state, showReplies: !state.showReplies };
      case "SET_LOADING_REPLIES":
        return { ...state, isLoadingReplies: action.loading };
      case "SET_REPLY_FORM":
        return { ...state, showReplyForm: action.open };
      case "SET_EDITING":
        return { ...state, isEditing: action.editing };
      case "SET_REPORT":
        return { ...state, showReportDialog: action.open };
    }
  }

  const [uiState, dispatchUI] = useReducer(uiReducer, {
    showReplies: false,
    isLoadingReplies: false,
    showReplyForm: false,
    isEditing: false,
    showReportDialog: false,
  });
  const { showReplies, isLoadingReplies, showReplyForm, isEditing, showReportDialog } = uiState;

  type VoteState = {
    userVote: VoteType | null;
    localUpvotes: number;
    localDownvotes: number;
  };

  type VoteAction =
    | { type: "VOTE"; voteType: VoteType }
    | { type: "REVERT"; prev: VoteState }
    | { type: "SYNC"; upvotes: number; downvotes: number };

  function voteReducer(state: VoteState, action: VoteAction): VoteState {
    switch (action.type) {
      case "VOTE": {
        const { userVote, localUpvotes, localDownvotes } = state;
        if (userVote === action.voteType) {
          return {
            userVote: null,
            localUpvotes: action.voteType === "up" ? localUpvotes - 1 : localUpvotes,
            localDownvotes: action.voteType === "down" ? localDownvotes - 1 : localDownvotes,
          };
        }
        let newUpvotes = localUpvotes;
        let newDownvotes = localDownvotes;
        if (userVote === "up") newUpvotes--;
        else if (userVote === "down") newDownvotes--;
        if (action.voteType === "up") newUpvotes++;
        else newDownvotes++;
        return {
          userVote: action.voteType,
          localUpvotes: newUpvotes,
          localDownvotes: newDownvotes,
        };
      }
      case "REVERT":
        return action.prev;
      case "SYNC":
        return {
          ...state,
          localUpvotes: action.upvotes,
          localDownvotes: action.downvotes,
        };
    }
  }

  const initialVote = userVotes.find((v) => v.commentId === comment.id);
  const [voteState, dispatchVote] = useReducer(voteReducer, {
    userVote: initialVote ? (initialVote.value === 1 ? "up" : "down") : null,
    localUpvotes: comment.upvotes,
    localDownvotes: comment.downvotes,
  });
  const { userVote, localUpvotes, localDownvotes } = voteState;
  const isBanned = currentUser?.banned;

  useEffect(() => {
    dispatchVote({
      type: "SYNC",
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
    });
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
      dispatchUI({ type: "SET_LOADING_REPLIES", loading: true });
      try {
        await onLoadReplies(comment.id);
      } finally {
        dispatchUI({ type: "SET_LOADING_REPLIES", loading: false });
      }
    }
    dispatchUI({ type: "TOGGLE_REPLIES" });
  };

  const handleVote = async (voteType: VoteType) => {
    if (!onVote) return;

    const previousState = voteState;
    const actionArg = userVote === voteType ? "unset" : voteType;

    dispatchVote({ type: "VOTE", voteType });

    try {
      await onVote(comment.id, actionArg);
    } catch (error) {
      console.error("Failed to vote:", error);
      dispatchVote({ type: "REVERT", prev: previousState });
    }
  };

  const handleReplySubmit = async (
    content: string,
    attachment?: components["schemas"]["UploadResponse"],
  ) => {
    if (!onReply) return;
    try {
      await onReply(comment.id, content, attachment);
      dispatchUI({ type: "SET_REPLY_FORM", open: false });
      // If replies aren't shown yet, show them after posting
      if (!showReplies && hasReplies) {
        void handleShowReplies();
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const displayReplies =
    "replies" in comment && Array.isArray(comment.replies) ? comment.replies : [];

  return (
    <>
      <div className={cn("flex gap-2", depth > 0 && "relative")}>
        {depth > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 sm:-left-4 top-0 size-4 rounded-bl-md border-b border-l border-accent"
          />
        )}
        <div className="flex flex-col gap-2 items-center">
          <Avatar name={comment.userProfile.username} />
          {displayReplies.length > 0 && showReplies && (
            <span
              aria-hidden="true"
              className="pointer-events-none relative left-0 top-0 h-full w-px bg-accent"
            />
          )}
        </div>
        <div className="flex-1 min-w-0 mb-2">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <Link
              to="/user/$userId"
              params={{ userId: comment.userProfile.id }}
              className="font-medium text-foreground hover:underline"
            >
              {comment.userProfile.displayName}
            </Link>
            <span className="text-muted-foreground truncate">@{comment.userProfile.username}</span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {formatDate(comment.createdAt)}
            </span>
            {comment.edited && (
              <>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <span className="text-muted-foreground text-xs">edited</span>
              </>
            )}

            <CommentMenu
              onReport={() => dispatchUI({ type: "SET_REPORT", open: true })}
              onEdit={() =>
                dispatchUI({
                  type: "SET_EDITING",
                  editing: true,
                })
              }
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
              isOwner={currentUser ? comment.userProfile.id === currentUser.userId : false}
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
              className="min-h-[80px] resize-none text-sm sm:text-base mb-1"
            />
          ) : (
            <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">
              {comment.content}
            </p>
          )}

          {comment.attachment && <CommentAttachment attachment={comment.attachment} />}

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 sm:h-7 sm:w-7 p-0 hover:bg-accent",
                  userVote === "up" && "bg-primary/10 text-primary hover:bg-primary/20",
                )}
                onClick={() => handleVote("up")}
                disabled={comment.deleted || isBanned}
                aria-label="Upvote Comment"
              >
                <ChevronUp className="size-4" />
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
                aria-label="Downvote Comment"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>

            {isEditing ? (
              <ButtonGroup orientation="horizontal">
                <Button
                  variant="outline"
                  onClick={() => {
                    dispatchUI({
                      type: "SET_EDITING",
                      editing: false,
                    });
                    setEditContent(comment.content);
                  }}
                  size="sm"
                  className="h-8 w-15 sm:h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!onEdit) return;
                    try {
                      await onEdit(comment.id, editContent);
                      dispatchUI({
                        type: "SET_EDITING",
                        editing: false,
                      });
                    } catch (error) {
                      console.error("Failed to edit comment:", error);
                    }
                  }}
                  size="sm"
                  className="h-8 w-15 sm:h-7 px-2 text-xs"
                >
                  Save
                </Button>
              </ButtonGroup>
            ) : (
              <ButtonGroup orientation="horizontal">
                {hasReplies && (
                  <>
                    <Button
                      onClick={handleShowReplies}
                      variant="outline"
                      size="sm"
                      className="h-8 sm:h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="size-3" />
                      <span className="sr-only sm:not-sr-only">
                        {isLoadingReplies
                          ? "Loading..."
                          : showReplies
                            ? "Hide replies"
                            : `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                      </span>
                    </Button>
                  </>
                )}
                {currentUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 sm:h-7 px-2 text-xs text-muted-foreground hover:text-foreground",
                      showReplyForm && "bg-primary/10 text-primary hover:bg-primary/20",
                    )}
                    onClick={() =>
                      dispatchUI({
                        type: "SET_REPLY_FORM",
                        open: !showReplyForm,
                      })
                    }
                    disabled={comment.deleted || isBanned}
                  >
                    <MessageSquareReply className="size-3" />
                    <span className="sr-only sm:not-sr-only">Reply</span>
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
                onCancel={() =>
                  dispatchUI({
                    type: "SET_REPLY_FORM",
                    open: false,
                  })
                }
                currentUser={currentUser}
              />
            </div>
          )}
        </div>
        <ReportCommentDialog
          commentId={comment.id}
          isOpen={showReportDialog}
          onOpenChange={(open) => dispatchUI({ type: "SET_REPORT", open })}
        />
      </div>
      {showReplies && displayReplies.length > 0 && (
        <>
          {displayReplies.map((reply, index) => {
            const isLast = index === displayReplies.length - 1;
            return (
              <div key={reply.id} className={cn("relative pl-2 sm:pl-4", depth >= 0 && "ml-4")}>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-full w-px bg-accent"
                  />
                )}
                <Comment
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
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
