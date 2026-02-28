import { client, serverHeaders } from "@/lib/api";
import { permanentRedirect, redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").at(-1);
    if (!id) {
        redirect(`/`);
    }

    const { data, error } = await client.GET("/v2/manga/ani/{id}", {
        params: {
            path: {
                id: Number(id),
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        redirect(`/`);
    }

    permanentRedirect(`/manga/${data.data.id}`);
}
