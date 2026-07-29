import { client } from "@/lib/api";

const PAGE_SIZE = 100;

type Bookmark = components["schemas"]["BookmarkResponse"][][number];

export async function exportBookmarks() {
    const bookmarks = await fetchAllBookmarks();
    const simplified = bookmarks.map(simplifyBookmark);
    const bookmarksBlob = new Blob([JSON.stringify(simplified, null, 2)], {
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

    return simplified.length;
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

function simplifyBookmark(b: Bookmark) {
    return {
        mangaId: b.mangaId,
        title: b.title,
        alternativeTitles: b.alternativeTitles,
        authors: b.authors,
        genres: b.genres,
        trackers: b.trackers,
        lastReadChapter: b.lastReadChapter
            ? {
                  number: b.lastReadChapter.number,
                  title: b.lastReadChapter.title,
              }
            : null,
    };
}
