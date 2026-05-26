import { client, serverHeaders } from "@/lib/api";
import { MangaCommentList } from "./manga-comment-list";
import { useQuery } from "@tanstack/react-query";

function getMangaComments(id: string) {
  return client.GET("/v2/comments/{id}", {
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
}

export type CommentTarget = "manga" | "chapter";

export function MangaComments({ id, target }: { id: string; target: CommentTarget }) {
  const { data, error } = useQuery({
    queryKey: ["manga-comments", id],
    queryFn: async () => {
      const { data, error } = await getMangaComments(id);
      if (error) throw error;
      return data.data;
    },
  });

  if (error) return null;
  if (!data) return null;

  const commentsWithReplies: components["schemas"]["CommentWithRepliesResponse"][] = (
    data.items || []
  ).map((comment) => ({
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
