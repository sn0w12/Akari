import { client } from "@/lib/api";
import { cacheLife, cacheTag } from "next/cache";
import { RemotePrompt } from "./remote-prompt";

async function fetchRemotePrompts() {
    "use cache";
    cacheLife("hours");
    cacheTag("users");

    const { data, error } = await client.GET("/v2/notifications/website");
    if (error) {
        return { data: null, error };
    }
    return { data, error: null };
}

export async function RemotePrompts() {
    const { data, error } = await fetchRemotePrompts();

    if (error || !data) {
        return null;
    }

    return (
        <>
            {data.data.map((prompt) => (
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
