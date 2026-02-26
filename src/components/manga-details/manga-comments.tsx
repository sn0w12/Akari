"use server";

import { client, serverHeaders } from "@/lib/api";
import { MangaCommentList } from "./manga-comment-list";

async function getMangaComments(id: string) {
    const { data, error } = await client.GET("/v2/comments/{id}", {
        params: {
            path: {
                id: id,
            },
            query: {
                page: 1,
                pageSize: 20,
                sort: "Upvoted",
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data: data.data, error: null };
}

export type CommentTarget = "manga" | "chapter";

interface MangaCommentsProps {
    params: Promise<{ id: string }>;
    target: CommentTarget;
}

export async function MangaComments({ params, target }: MangaCommentsProps) {
    const id = (await params).id;
    const { data, error } = await getMangaComments(id);

    if (error) {
        return null;
    }

    // Convert CommentResponse[] to CommentWithRepliesResponse[] with empty replies
    const commentsWithReplies: components["schemas"]["CommentWithRepliesResponse"][] =
        (data.items || []).map((comment) => ({
            ...comment,
            replies: [],
        }));

    return (
        <MangaCommentList
            initialComments={commentsWithReplies}
            mangaId={id}
            totalPages={data.totalPages}
            target={target}
        />
    );
}
