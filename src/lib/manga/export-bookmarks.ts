import { client } from "@/lib/api";

const PAGE_SIZE = 100;

type Bookmark = components["schemas"]["BookmarkListResponse"]["items"][number];

export async function exportBookmarks() {
    const bookmarks = await fetchAllBookmarks();
    const bookmarksBlob = new Blob([JSON.stringify(bookmarks, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(bookmarksBlob);
    const a = Object.assign(document.createElement("a"), {
        href: url,
        download: "bookmarks.json",
    });

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return bookmarks.length;
}

async function fetchAllBookmarks() {
    const allBookmarks: Bookmark[] = [];
    const { data: firstData, error: firstError } = await client.GET(
        "/v2/bookmarks",
        {
            params: {
                query: {
                    page: 1,
                    pageSize: PAGE_SIZE,
                },
            },
        },
    );

    if (firstError || !firstData) {
        throw new Error("Error fetching bookmarks");
    }

    allBookmarks.push(...firstData.data.items);
    const totalPages = firstData.data.totalPages;

    if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(
                client.GET("/v2/bookmarks", {
                    params: { query: { page, pageSize: PAGE_SIZE } },
                }),
            );
        }

        const results = await Promise.all(pagePromises);

        for (const { data, error } of results) {
            if (error || !data) {
                throw new Error("Error fetching bookmarks");
            }
            allBookmarks.push(...data.data.items);
        }
    }

    return allBookmarks;
}
