import { exec as execCallback } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const exec = util.promisify(execCallback);

const CACHE_DIR = "/app/.next/server/app";
const MAX_SIZE_GB = 2; // Max total cache size
const SCAN_INTERVAL_MS = 60_000; // Check every 60 seconds
const TARGET_ROUTES = ["manga", "genre", "author"];

// Convert GB to bytes
const MAX_SIZE = MAX_SIZE_GB * 1024 ** 3;

async function getCurrentSize(dir) {
    const { stdout } = await exec(`du -sb ${dir}`);
    return parseInt(stdout.split("\t")[0], 10);
}

// Get all files recursively with their atime, skipping [id] related
async function getFilesWithAtime(dir) {
    const results = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            // Skip files and folders with brackets in name (dynamic placeholders)
            if (entry.name.includes("[") || entry.name.includes("]")) {
                continue;
            }
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile()) {
                const stats = fs.statSync(fullPath);
                results.push({
                    path: fullPath,
                    atime: stats.atimeMs,
                    size: stats.size,
                });
            }
        }
    }

    walk(dir);
    return results;
}

async function evictCache() {
    let totalSize = await getCurrentSize(CACHE_DIR);

    if (totalSize <= MAX_SIZE) return;

    const allFiles = [];

    // Collect files from target routes
    for (const route of TARGET_ROUTES) {
        const routeDir = path.join(CACHE_DIR, route, "[id]");
        if (fs.existsSync(routeDir)) {
            const files = await getFilesWithAtime(routeDir);
            allFiles.push(...files);
        }
    }

    if (allFiles.length === 0) return;

    // Sort files by atime (oldest first)
    allFiles.sort((a, b) => a.atime - b.atime);

    for (const file of allFiles) {
        if (totalSize <= MAX_SIZE) break;
        try {
            fs.unlinkSync(file.path);
            totalSize -= file.size;
            console.log(
                `[Evict] Removed ${file.path}, freed ${(file.size / 1024 ** 2).toFixed(1)} MB`,
            );
        } catch (e) {
            console.error(
                `[Error] Failed to delete ${file.path}: ${e.message}`,
            );
        }
    }
}

async function mainLoop() {
    while (true) {
        try {
            await evictCache();
        } catch (e) {
            console.error(e);
        }
        await new Promise((resolve) => setTimeout(resolve, SCAN_INTERVAL_MS));
    }
}

mainLoop();
