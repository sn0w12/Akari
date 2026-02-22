import { decompressUUIDBase58 } from "@/lib/uuid";
import { permanentRedirect, redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split("/").at(-1);
    if (!id) {
        redirect(`/`);
    }

    const decompressedId = decompressUUIDBase58(id);
    permanentRedirect(`/lists/${decompressedId}`);
}
