import { client } from "@/lib/api";
import { RemotePrompt } from "./remote-prompt";
import { useQuery } from "@tanstack/react-query";

function fetchRemotePrompts() {
    return client.GET("/v2/notifications/website");
}

export function RemotePrompts() {
    const { data, error } = useQuery({
        queryKey: ["remote-prompts"],
        queryFn: async () => {
            const { data, error } = await fetchRemotePrompts();
            if (error) throw error;
            return data.data;
        },
    });

    if (error) return null;
    if (!data) return null;

    return (
        <>
            {data.map((prompt) => (
                <RemotePrompt
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    content={prompt.content}
                />
            ))}
        </>
    );
}
