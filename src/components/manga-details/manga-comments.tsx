"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { CommentList } from "@/components/comments/comment-list";
import Toast from "@/lib/toast-wrapper";
import type { CommentData, VoteType } from "@/components/comments/comment";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "../ui/skeleton";

function MangaCommentList({
    comments,
    onLoadReplies,
    onVote,
    onReply,
    onEdit,
    onDelete,
    onNewComment,
    userVotes,
    currentUser,
}: {
    comments: components["schemas"]["CommentWithRepliesResponse"][];
    onLoadReplies: (commentId: string) => Promise<void>;
    onVote: (commentId: string, voteType: VoteType) => Promise<void>;
    onReply: (parentId: string, content: string) => Promise<CommentData>;
    onEdit: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onNewComment: (content: string) => Promise<void>;
    userVotes: components["schemas"]["CommentVoteResponse"][];
    currentUser?: components["schemas"]["UserResponse"];
}) {
    return (
        <CommentList
            comments={comments}
            onLoadReplies={onLoadReplies}
            onVote={onVote}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onNewComment={onNewComment}
            userVotes={userVotes}
            currentUser={currentUser}
        />
    );
}

export function MangaComments({
    manga,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
}) {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["comments", manga.id],
        queryFn: async () => {
            const { data, error } = await client.GET("/v2/comments/{id}", {
                params: {
                    path: {
                        id: manga.id,
                    },
                },
            });

            if (error) {
                return null;
            }

            // Convert CommentResponse[] to CommentWithRepliesResponse[] with empty replies
            const commentsWithReplies: components["schemas"]["CommentWithRepliesResponse"][] =
                (data.data.items || []).map((comment) => ({
                    ...comment,
                    replies: [],
                }));

            return { ...data.data, items: commentsWithReplies };
        },
    });
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

        // Update the cache to include the loaded replies
        queryClient.setQueryData(
            ["comments", manga.id],
            (
                oldData: {
                    items?: components["schemas"]["CommentWithRepliesResponse"][];
                } | null
            ) => {
                if (!oldData || !oldData.items) return oldData;

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

                return {
                    ...oldData,
                    items: updateReplies(oldData.items, commentId, data.data),
                };
            }
        );
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
                    id: manga.id,
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

        queryClient.setQueryData(
            ["comments", manga.id],
            (
                oldData: {
                    items?: components["schemas"]["CommentWithRepliesResponse"][];
                } | null
            ) => {
                if (!oldData || !oldData.items) return oldData;
                return {
                    ...oldData,
                    items: insertReply(oldData.items, parentId, data.data),
                };
            }
        );

        new Toast("Reply posted successfully!", "success");
        return data.data;
    };

    const handleNewComment = async (content: string): Promise<void> => {
        const { data, error } = await client.POST("/v2/comments/{id}", {
            params: {
                path: {
                    id: manga.id,
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

        queryClient.setQueryData(
            ["comments", manga.id],
            (
                oldData: {
                    items?: components["schemas"]["CommentWithRepliesResponse"][];
                } | null
            ) => {
                if (!oldData) return oldData;
                const newComment = {
                    ...data.data,
                    replies: [],
                } as components["schemas"]["CommentWithRepliesResponse"];
                return {
                    ...oldData,
                    items: [newComment, ...(oldData.items || [])],
                };
            }
        );

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

        queryClient.setQueryData(
            ["comments", manga.id],
            (
                oldData: {
                    items?: components["schemas"]["CommentWithRepliesResponse"][];
                } | null
            ) => {
                if (!oldData || !oldData.items) return oldData;
                return {
                    ...oldData,
                    items: updateCommentContent(
                        oldData.items,
                        commentId,
                        content
                    ),
                };
            }
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

        queryClient.setQueryData(
            ["comments", manga.id],
            (
                oldData: {
                    items?: components["schemas"]["CommentWithRepliesResponse"][];
                } | null
            ) => {
                if (!oldData || !oldData.items) return oldData;
                return {
                    ...oldData,
                    items: updateCommentContent(
                        oldData.items,
                        commentId,
                        "[deleted]"
                    ),
                };
            }
        );

        new Toast("Comment deleted successfully!", "success");
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 pb-2 border-b">Comments</h2>
            {isLoading || userLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            ) : (
                <MangaCommentList
                    comments={data?.items ?? []}
                    onLoadReplies={handleLoadReplies}
                    onVote={handleVote}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNewComment={handleNewComment}
                    userVotes={[]}
                    currentUser={user}
                />
            )}
        </div>
    );
}
