"use client";

import {
    Comment,
    VoteType,
    type CommentData,
} from "@/components/comments/comment";
import { CommentForm } from "@/components/comments/comment-form";

interface CommentListProps {
    comments: CommentData[];
    onLoadReplies?: (commentId: string) => Promise<void>;
    onVote?: (commentId: string, voteType: VoteType) => Promise<void>;
    onReply?: (parentId: string, content: string) => Promise<CommentData>;
    onEdit?: (commentId: string, content: string) => Promise<void>;
    onDelete?: (commentId: string) => Promise<void>;
    onNewComment?: (content: string) => Promise<void>;
    userVotes?: components["schemas"]["CommentVoteResponse"][];
    currentUser?: components["schemas"]["UserResponse"];
}

export function CommentList({
    comments,
    onLoadReplies,
    onVote,
    onReply,
    onEdit,
    onDelete,
    onNewComment,
    userVotes = [],
    currentUser,
}: CommentListProps) {
    return (
        <div className="space-y-2">
            {onNewComment && (
                <CommentForm
                    onSubmit={onNewComment}
                    placeholder="Write a comment..."
                    currentUser={currentUser}
                />
            )}

            {comments.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No comments yet. Be the first to comment!
                    </p>
                </div>
            ) : (
                comments.map((comment) => (
                    <Comment
                        key={comment.id}
                        comment={comment}
                        onLoadReplies={onLoadReplies}
                        onVote={onVote}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        userVotes={userVotes}
                        currentUser={currentUser}
                    />
                ))
            )}
        </div>
    );
}
