"use server";

import { client, serverHeaders } from "@/lib/api";
import { MangaCommentList } from "@/components/manga-details/manga-comment-list";

export async function ChapterComments({
    chapter,
}: {
    chapter: components["schemas"]["ChapterResponse"];
}) {
    const { data, error } = await client.GET("/v2/comments/{id}", {
        params: {
            path: {
                id: chapter.id,
            },
        },
        headers: serverHeaders,
    });

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
        (data.data.items || []).map((comment) => ({
            ...comment,
            replies: [],
        }));

    return (
        <div id="comments">
            <h2 className="text-2xl font-bold mb-2 pb-2 border-b">Comments</h2>
            <MangaCommentList
                initialComments={commentsWithReplies}
                mangaId={chapter.id}
            />
        </div>
    );
}
