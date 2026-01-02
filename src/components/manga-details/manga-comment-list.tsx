"use client";

import { useState } from "react";
import { CommentList } from "@/components/comments/comment-list";
import Toast from "@/lib/toast-wrapper";
import type { CommentData, VoteType } from "@/components/comments/comment";
import { useUser } from "@/contexts/user-context";
import { client } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { CommentSorting } from "../comments/sorting";

interface MangaCommentListProps {
    initialComments: components["schemas"]["CommentWithRepliesResponse"][];
    mangaId: string;
    totalPages: number;
}

export function MangaCommentList({
    initialComments,
    mangaId,
    totalPages,
}: MangaCommentListProps) {
    const [sortOrder, setSortOrder] =
        useState<components["schemas"]["CommentSortOrder"]>("Upvoted");

    const { data: userVoteData } = useQuery({
        queryKey: [mangaId],
        refetchOnMount: false,
        enabled: initialComments.length > 0,
        queryFn: async () => {
            const { data, error } = await client.GET(
                "/v2/comments/{id}/votes",
                {
                    params: {
                        path: {
                            id: mangaId,
                        },
                    },
                }
            );

            if (error) {
                throw new Error(
                    error.data.message || "Error fetching search results"
                );
            }

            return data.data;
        },
    });
    const [comments, setComments] =
        useState<components["schemas"]["CommentWithRepliesResponse"][]>(
            initialComments
        );
    const { user } = useUser();
    const [currentPage, setCurrentPage] = useState(1);

    const handleSortChange = (
        newSort: components["schemas"]["CommentSortOrder"]
    ) => {
        setSortOrder(newSort);
        sortMutation.mutate(newSort);
    };

    const loadMoreMutation = useMutation({
        mutationFn: (page: number) =>
            client
                .GET("/v2/comments/{id}", {
                    params: {
                        path: {
                            id: mangaId,
                        },
                        query: {
                            page: page,
                            pageSize: 20,
                            sort: sortOrder,
                        },
                    },
                })
                .then((res) => res.data?.data),
        onSuccess: (data) => {
            if (!data) return;
            const newComments: components["schemas"]["CommentWithRepliesResponse"][] =
                (data.items || []).map((comment) => ({
                    ...comment,
                    replies: [],
                }));
            setComments((prev) => [...prev, ...newComments]);
            setCurrentPage((prev) => prev + 1);
        },
        onError: () => {
            new Toast("Failed to load more comments.", "error");
        },
    });

    const sortMutation = useMutation({
        mutationFn: (sort: components["schemas"]["CommentSortOrder"]) =>
            client
                .GET("/v2/comments/{id}", {
                    params: {
                        path: {
                            id: mangaId,
                        },
                        query: {
                            page: 1,
                            pageSize: 20,
                            sort: sort,
                        },
                    },
                })
                .then((res) => res.data?.data),
        onSuccess: (data) => {
            if (!data) return;
            const newComments: components["schemas"]["CommentWithRepliesResponse"][] =
                (data.items || []).map((comment) => ({
                    ...comment,
                    replies: [],
                }));
            setComments(newComments);
            setCurrentPage(1);
        },
        onError: () => {
            new Toast("Failed to load comments.", "error");
        },
    });

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
        content: string,
        attachment?: components["schemas"]["UploadResponse"]
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
                attachmentId: attachment?.id,
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

    const handleNewComment = async (
        content: string,
        attachment?: components["schemas"]["UploadResponse"]
    ): Promise<void> => {
        const { data, error } = await client.POST("/v2/comments/{id}", {
            params: {
                path: {
                    id: mangaId,
                },
            },
            body: {
                targetType: "manga",
                content: content,
                attachmentId: attachment?.id,
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

    return (
        <>
            <div className="flex flex-row justify-between mb-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">Comments</h2>
                <CommentSorting
                    sort={sortOrder}
                    onSortChange={handleSortChange}
                />
            </div>
            <CommentList
                comments={comments}
                onLoadReplies={handleLoadReplies}
                onVote={handleVote}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNewComment={handleNewComment}
                userVotes={userVoteData}
                currentUser={user}
            />
            {currentPage < totalPages && (
                <div className="flex flex-1 justify-center mt-4">
                    <Button
                        onClick={() => loadMoreMutation.mutate(currentPage + 1)}
                        disabled={loadMoreMutation.isPending}
                        variant="outline"
                        className="w-full"
                    >
                        {loadMoreMutation.isPending
                            ? "Loading..."
                            : "Load More Comments"}
                    </Button>
                </div>
            )}
        </>
    );
}
