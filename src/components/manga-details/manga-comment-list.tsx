"use client";

import { useState } from "react";
import { CommentList } from "@/components/comments/comment-list";
import Toast from "@/lib/toast-wrapper";
import type { CommentData, VoteType } from "@/components/comments/comment";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "../ui/skeleton";
import { client } from "@/lib/api";

interface MangaCommentListProps {
    initialComments: components["schemas"]["CommentWithRepliesResponse"][];
    mangaId: string;
}

export function MangaCommentList({
    initialComments,
    mangaId,
}: MangaCommentListProps) {
    const [comments, setComments] =
        useState<components["schemas"]["CommentWithRepliesResponse"][]>(
            initialComments
        );
    const { user, isLoading: userLoading } = useUser();

    // Helper function to recursively update comment content
    const updateCommentContent = (
        comments: components["schemas"]["CommentWithRepliesResponse"][],
        commentId: string,
        newContent: string
    ): components["schemas"]["CommentWithRepliesResponse"][] => {
        return comments.map((comment) => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    content: newContent,
                };
            } else if (comment.replies) {
                return {
                    ...comment,
                    replies: updateCommentContent(
                        comment.replies,
                        commentId,
                        newContent
                    ),
                };
            }
            return comment;
        });
    };

    const handleLoadReplies = async (commentId: string): Promise<void> => {
        const { data, error } = await client.GET(
            "/v2/comments/{commentId}/replies",
            {
                params: {
                    path: {
                        commentId: commentId,
                    },
                },
            }
        );
        if (error) {
            console.error("Failed to load replies:", error);
            return;
        }

        // Update the local state to include the loaded replies
        setComments((prevComments) => {
            const updateReplies = (
                comments: components["schemas"]["CommentWithRepliesResponse"][],
                commentId: string,
                replies: components["schemas"]["CommentWithRepliesResponse"][]
            ): components["schemas"]["CommentWithRepliesResponse"][] => {
                return comments.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            replies: replies,
                        };
                    } else if (comment.replies) {
                        return {
                            ...comment,
                            replies: updateReplies(
                                comment.replies,
                                commentId,
                                replies
                            ),
                        };
                    }
                    return comment;
                });
            };

            return updateReplies(prevComments, commentId, data.data);
        });
    };

    const handleVote = async (
        commentId: string,
        voteType: VoteType
    ): Promise<void> => {
        const { error } = await client.POST("/v2/comments/{commentId}/vote", {
            params: {
                path: {
                    commentId: commentId,
                },
            },
            body: {
                value: voteType === "up" ? 1 : voteType === "unset" ? 0 : -1,
            },
        });

        if (error) {
            new Toast("Failed to vote. Please try again.", "error");
            return;
        }
    };

    const handleReply = async (
        parentId: string,
        content: string
    ): Promise<CommentData> => {
        const { data, error } = await client.POST("/v2/comments/{id}", {
            params: {
                path: {
                    id: mangaId,
                },
            },
            body: {
                targetType: "manga",
                content: content,
                parentId: parentId,
            },
        });

        if (error) {
            new Toast("Failed to post reply. Please try again.", "error");
            throw error; // Re-throw so the caller can handle it
        }

        // Helper function to recursively find and update the parent comment
        const insertReply = (
            comments: components["schemas"]["CommentWithRepliesResponse"][],
            parentId: string,
            newReply: CommentData
        ): components["schemas"]["CommentWithRepliesResponse"][] => {
            return comments.map((comment) => {
                if (comment.id === parentId) {
                    // Found the parent comment, add the reply to its replies
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            newReply as components["schemas"]["CommentWithRepliesResponse"],
                        ],
                    };
                } else if (comment.replies) {
                    // Recursively search in replies
                    return {
                        ...comment,
                        replies: insertReply(
                            comment.replies,
                            parentId,
                            newReply
                        ),
                    };
                }
                return comment;
            });
        };

        setComments((prevComments) =>
            insertReply(prevComments, parentId, data.data)
        );

        new Toast("Reply posted successfully!", "success");
        return data.data;
    };

    const handleNewComment = async (content: string): Promise<void> => {
        const { data, error } = await client.POST("/v2/comments/{id}", {
            params: {
                path: {
                    id: mangaId,
                },
            },
            body: {
                targetType: "manga",
                content: content,
            },
        });

        if (error) {
            new Toast("Failed to post comment. Please try again.", "error");
            return;
        }

        const newComment = {
            ...data.data,
            replies: [],
        } as components["schemas"]["CommentWithRepliesResponse"];

        setComments((prevComments) => [newComment, ...prevComments]);

        new Toast("Comment posted successfully!", "success");
    };

    const handleEdit = async (
        commentId: string,
        content: string
    ): Promise<void> => {
        const { error } = await client.PUT("/v2/comments/{commentId}", {
            params: {
                path: {
                    commentId: commentId,
                },
            },
            body: {
                content: content,
            },
        });

        if (error) {
            new Toast("Failed to edit comment. Please try again.", "error");
            return;
        }

        setComments((prevComments) =>
            updateCommentContent(prevComments, commentId, content)
        );

        new Toast("Comment edited successfully!", "success");
    };

    const handleDelete = async (commentId: string): Promise<void> => {
        const { error } = await client.DELETE("/v2/comments/{commentId}", {
            params: {
                path: {
                    commentId: commentId,
                },
            },
        });

        if (error) {
            new Toast("Failed to delete comment. Please try again.", "error");
            return;
        }

        setComments((prevComments) =>
            updateCommentContent(prevComments, commentId, "[deleted]")
        );

        new Toast("Comment deleted successfully!", "success");
    };

    if (userLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
        );
    }

    return (
        <CommentList
            comments={comments}
            onLoadReplies={handleLoadReplies}
            onVote={handleVote}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNewComment={handleNewComment}
            userVotes={[]}
            currentUser={user}
        />
    );
}
