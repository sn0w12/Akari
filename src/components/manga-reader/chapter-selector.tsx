import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
    Combobox,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxTrigger,
    ComboboxValue,
} from "@/components/ui/combobox";
import { useWindowWidth } from "@/hooks/use-window-width";
import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { fillChapterGaps } from "@/lib/manga/chapters";

interface ChapterSelectorProps {
    chapters: components["schemas"]["MangaChapter"][];
    value: string;
    scanlatorId: number;
    className?: string;
}

export function ChapterSelector({
    chapters,
    value,
    scanlatorId,
    className,
}: ChapterSelectorProps) {
    const width = useWindowWidth();
    const router = useRouter();

    const filledChapters = useMemo(() => {
        return fillChapterGaps(scanlatorId, chapters);
    }, [chapters, scanlatorId]);
    const selectedChapter = useMemo(
        () => filledChapters.find((c) => c.id === value),
        [filledChapters, value],
    );

    const onChange = (newValue: string) => {
        const newChapter = chapters.find((c) => c.id === newValue);
        if (!newChapter) return;
        void router.navigate({
            to: `../../${newChapter.scanlatorId}/${newChapter.number}`,
        });
    };

    return (
        <>
            {width < 768 ? (
                <NativeSelect
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    aria-label="Select chapter"
                    className={cn("h-9 w-auto w-full", className)}
                >
                    {chapters.map((chapter) => (
                        <NativeSelectOption key={chapter.id} value={chapter.id}>
                            {chapter.title}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>
            ) : (
                <Combobox
                    value={selectedChapter ?? null}
                    itemToStringLabel={(chapter) => {
                        return chapter.title;
                    }}
                    items={chapters}
                    onValueChange={(chapter) => {
                        if (chapter) onChange(chapter.id);
                    }}
                >
                    <ComboboxTrigger
                        render={
                            <Button
                                variant="outline"
                                aria-label="Select chapter"
                                className={cn(
                                    "w-52 justify-between flex",
                                    className,
                                )}
                            />
                        }
                    >
                        <ComboboxValue placeholder="Select Chapter" />
                        <ChevronsUpDownIcon className="-me-1! ml-2 size-4 shrink-0 opacity-50" />
                    </ComboboxTrigger>
                    <ComboboxPopup aria-label="Select chapter">
                        <div className="border-b p-2">
                            <ComboboxInput
                                className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
                                placeholder="Search chapter..."
                                showTrigger={false}
                                startAddon={<SearchIcon />}
                            />
                        </div>
                        <ComboboxEmpty>No chapter found.</ComboboxEmpty>
                        <ComboboxList>
                            {(chapter: {
                                id: string;
                                title: string;
                                scanlatorId: number;
                            }) => (
                                <ComboboxItem key={chapter.id} value={chapter}>
                                    {chapter.title}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxPopup>
                </Combobox>
            )}
        </>
    );
}
