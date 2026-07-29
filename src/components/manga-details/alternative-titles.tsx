import { useMemo } from "react";
import {
    ResponsiveModal,
    ResponsiveModalDrawerOnly,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
    ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { Button } from "../ui/button";
import { LanguagesIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { capitalize, cn } from "@/lib/utils";

type WorkTitle = components["schemas"]["AlternativeTitle"];

export interface AlternativeTitlesPopoverProps {
    titles: WorkTitle[];
}

interface LanguageInfo {
    /** English name of the language */
    name: string;
    /** Endonym — the language's name in its own script */
    native: string;
    /** Two-letter region flag emoji is intentionally avoided; we use a short label instead */
    label: string;
}

export type TitleType =
    | "official"
    | "alternative"
    | "romanized"
    | "translated"
    | "short";

const LANGUAGES: Record<string, LanguageInfo> = {
    ja: { name: "Japanese", native: "日本語", label: "JA" },
    ko: { name: "Korean", native: "한국어", label: "KO" },
    zh: { name: "Chinese", native: "中文", label: "ZH" },
    en: { name: "English", native: "English", label: "EN" },
    es: { name: "Spanish", native: "Español", label: "ES" },
    pt: { name: "Portuguese", native: "Português", label: "PT" },
    fr: { name: "French", native: "Français", label: "FR" },
    de: { name: "German", native: "Deutsch", label: "DE" },
    it: { name: "Italian", native: "Italiano", label: "IT" },
    ru: { name: "Russian", native: "Русский", label: "RU" },
    vi: { name: "Vietnamese", native: "Tiếng Việt", label: "VI" },
    th: { name: "Thai", native: "ไทย", label: "TH" },
    id: { name: "Indonesian", native: "Bahasa Indonesia", label: "ID" },
    tr: { name: "Turkish", native: "Türkçe", label: "TR" },
    hi: { name: "Hindi", native: "हिंदी", label: "HI" },
    und: { name: "Undetermined", native: "Undetermined", label: "??" },
};

export function getLanguage(code: string): LanguageInfo {
    return (
        LANGUAGES[code] ?? {
            name: code.toUpperCase(),
            native: code.toUpperCase(),
            label: code.slice(0, 2).toUpperCase(),
        }
    );
}

const TYPE_ORDER: TitleType[] = [
    "official",
    "romanized",
    "translated",
    "alternative",
    "short",
];
function sortTitles(titles: WorkTitle[]): WorkTitle[] {
    return [...titles].sort((a, b) => {
        const byLang = getLanguage(a.languageCode).name.localeCompare(
            getLanguage(b.languageCode).name,
        );
        if (byLang !== 0) return byLang;
        return (
            TYPE_ORDER.indexOf(a.titleType as TitleType) -
            TYPE_ORDER.indexOf(b.titleType as TitleType)
        );
    });
}

export function AlternativeTitlesPopover({
    titles,
}: AlternativeTitlesPopoverProps) {
    const sorted = useMemo(() => sortTitles(titles), [titles]);

    return (
        <ResponsiveModal desktop="popover">
            <ResponsiveModalTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Alternative titles"
                        className="relative shrink-0"
                    >
                        <LanguagesIcon className="size-4" />
                        <Badge size="sm" className="absolute -top-1 -right-1">
                            {titles.length}
                        </Badge>
                    </Button>
                }
            />
            <ResponsiveModalPopup
                side="bottom"
                align="start"
                dialogClassName="w-80"
            >
                <ResponsiveModalPanel>
                    <ResponsiveModalTitle>Also known as</ResponsiveModalTitle>
                    <ResponsiveModalDrawerOnly>
                        <Separator className="mt-1" />
                    </ResponsiveModalDrawerOnly>
                    <ScrollArea
                        render={<ul />}
                        className="max-h-72 overflow-y-auto overscroll-contain"
                    >
                        {sorted.map((title) => {
                            const lang = getLanguage(title.languageCode);
                            return (
                                <li
                                    key={title.title}
                                    className="flex items-baseline gap-2 rounded-sm px-2 py-1"
                                >
                                    <Badge size="sm" variant="default">
                                        {lang.label}
                                    </Badge>
                                    <span
                                        className={cn(
                                            "min-w-0 flex-1 truncate text-sm",
                                            title.titleType === "official" &&
                                                "font-medium",
                                        )}
                                    >
                                        {title.title}
                                    </span>
                                    {title.titleType !== "official" ? (
                                        <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                                            {capitalize(title.titleType)}
                                        </span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ScrollArea>
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
