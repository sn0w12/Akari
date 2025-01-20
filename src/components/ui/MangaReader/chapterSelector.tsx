"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface ChapterSelectorProps {
    chapters: { value: string; label: string }[];
    value: string;
}

export function ChapterSelector({ chapters, value }: ChapterSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? chapters.find((chapter) => chapter.value === value)
                              ?.label
                        : "Select chapter..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                id="chapter-selector"
                className="w-[200px] p-0 relative z-[2000]"
            >
                <Command>
                    <CommandInput placeholder="Search chapter..." />
                    <CommandList>
                        <CommandEmpty>No chapter found.</CommandEmpty>
                        <CommandGroup>
                            {chapters.map((chapter) => (
                                <CommandItem
                                    key={chapter.value}
                                    value={chapter.value}
                                    onSelect={(currentValue) => {
                                        const currentUrl = window.location.href;
                                        const newUrl = currentUrl.replace(
                                            /\/[^\/]*$/,
                                            `/chapter-${currentValue}`,
                                        );
                                        router.push(newUrl);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === chapter.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                    {chapter.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
