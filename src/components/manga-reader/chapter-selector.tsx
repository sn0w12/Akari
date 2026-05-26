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

interface ChapterSelectorProps {
  chapters: { value: string; label: string }[];
  value: string;
  className?: string;
}

export function ChapterSelector({ chapters, value, className }: ChapterSelectorProps) {
  const width = useWindowWidth();
  const router = useRouter();

  const selectedChapter = useMemo(() => chapters.find((c) => c.value === value), [chapters, value]);

  const onChange = (newValue: string) => {
    void router.navigate({ to: `./${newValue}` });
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
            <NativeSelectOption key={chapter.value} value={chapter.value}>
              {chapter.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ) : (
        <Combobox
          value={selectedChapter ?? null}
          items={chapters}
          isItemEqualToValue={(a, b) => a.value === b.value}
          onValueChange={(chapter) => {
            if (chapter) onChange(chapter.value);
          }}
        >
          <ComboboxTrigger
            render={
              <Button
                variant="outline"
                aria-label="Select chapter"
                className={cn("w-52 justify-between flex", className)}
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
              {(chapter: { value: string; label: string }) => (
                <ComboboxItem key={chapter.value} value={chapter}>
                  {chapter.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>
      )}
    </>
  );
}
