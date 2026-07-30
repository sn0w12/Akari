type MangaChapter = components["schemas"]["MangaChapter"];
interface ChapterEntry extends MangaChapter {
    isGapFill?: boolean;
}

export function fillChapterGaps(
    primaryScanlatorId: number,
    allChapters: ChapterEntry[],
): ChapterEntry[] {
    const primaryChapters = allChapters.filter(
        (c) => c.scanlatorId === primaryScanlatorId,
    );
    const otherChapters = allChapters.filter(
        (c) => c.scanlatorId !== primaryScanlatorId,
    );

    const primaryInts = new Set(
        primaryChapters.map((c) => Math.floor(c.number)),
    );

    // Compute total integer chapter count per scanlator (across all chapters)
    const totalIntChaptersByScanlator = new Map<number, number>();
    for (const ch of allChapters) {
        if (ch.scanlatorId == null) continue;
        const current = totalIntChaptersByScanlator.get(ch.scanlatorId) ?? 0;
        totalIntChaptersByScanlator.set(ch.scanlatorId, current + 1);
    }

    // Build map: integer N → { scanlatorId, chapters[] } for gaps
    const gapMap = new Map<
        number,
        { scanlatorId: number; chapters: ChapterEntry[] }[]
    >();

    for (const ch of otherChapters) {
        const intPart = Math.floor(ch.number);
        if (primaryInts.has(intPart)) continue;

        if (!gapMap.has(intPart)) gapMap.set(intPart, []);

        const scanlatorGroups = gapMap.get(intPart)!;
        let group = scanlatorGroups.find(
            (g) => g.scanlatorId === ch.scanlatorId,
        );
        if (!group) {
            group = { scanlatorId: ch.scanlatorId!, chapters: [] };
            scanlatorGroups.push(group);
        }
        group.chapters.push(ch);
    }

    // For each gap, pick best scanlator by TOTAL integer chapter count
    const gapFills: ChapterEntry[] = [];
    for (const [, scanlatorGroups] of gapMap) {
        scanlatorGroups.sort((a, b) => {
            const aTotal = totalIntChaptersByScanlator.get(a.scanlatorId) ?? 0;
            const bTotal = totalIntChaptersByScanlator.get(b.scanlatorId) ?? 0;
            return bTotal - aTotal;
        });
        const bestGroup = scanlatorGroups[0];

        for (const ch of bestGroup.chapters) {
            gapFills.push({
                ...ch,
                scanlatorId: ch.scanlatorId!,
                isGapFill: true,
            });
        }
    }

    return [...primaryChapters, ...gapFills].sort((a, b) => {
        return b.number - a.number;
    });
}
