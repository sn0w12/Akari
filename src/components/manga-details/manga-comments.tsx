"use server";

import { client, serverHeaders } from "@/lib/api";
import { MangaCommentList } from "./manga-comment-list";
import { cacheLife, cacheTag } from "next/cache";

const getMangaComments = async (id: string) => {
    "use cache";
    cacheLife("minutes");
    cacheTag("comments", `comments-${id}`);

    const { data, error } = await client.GET("/v2/comments/{id}", {
        params: {
            path: {
                id: id,
            },
            query: {
                page: 1,
                pageSize: 20,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data: data.data, error: null };
};

export async function MangaComments({ id }: { id: string }) {
    const { data, error } = await getMangaComments(id);
    if (error) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-2 pb-2 border-b">
                    Comments
                </h2>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Failed to load comments. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    // Convert CommentResponse[] to CommentWithRepliesResponse[] with empty replies
    const commentsWithReplies: components["schemas"]["CommentWithRepliesResponse"][] =
        (data.items || []).map((comment) => ({
            ...comment,
            replies: [],
        }));

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 pb-2 border-b">Comments</h2>
            <MangaCommentList
                initialComments={commentsWithReplies}
                mangaId={id}
                totalPages={data.totalPages}
            />
        </div>
    );
}
