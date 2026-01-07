import { StartServer } from "@tanstack/start/server";
import { createRouter } from "./router";
import type { IncomingMessage, ServerResponse } from "http";

export async function render(req: IncomingMessage, res: ServerResponse) {
    const router = createRouter();

    const html = await router.renderToHtml(req.url || "/");

    res.setHeader("Content-Type", "text/html");
    res.end(html);
}
