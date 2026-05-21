import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dirs = {
    client: join(__dirname, "dist", "client"),
};

const MIME = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
};

const { default: app } = await import("./dist/server/server.js");

async function tryServeStatic(res, filePath, contentType) {
    try {
        const content = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
        return true;
    } catch {
        return false;
    }
}

const server = createServer(async (req, res) => {
    try {
        const url = new URL(
            req.url,
            `http://${req.headers.host || "localhost"}`,
        );

        const ext = extname(url.pathname);
        if (ext && ext !== ".html") {
            const path =
                url.pathname === "/" ? "index.html" : url.pathname.slice(1);
            const contentType = MIME[ext] || "application/octet-stream";

            if (await tryServeStatic(res, join(dirs.client, path), contentType))
                return;
        }

        // Forward to TanStack Start handler
        const body =
            req.method !== "GET" && req.method !== "HEAD"
                ? await new Promise((resolve) => {
                      const chunks = [];
                      req.on("data", (chunk) => chunks.push(chunk));
                      req.on("end", () => resolve(Buffer.concat(chunks)));
                  })
                : undefined;

        const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body,
        });

        const response = await app.fetch(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        if (response.body) {
            Readable.fromWeb(response.body).pipe(res);
        } else {
            res.end();
        }
    } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end();
    }
});

const PORT = parseInt(process.env.PORT || "3000", 10);
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
