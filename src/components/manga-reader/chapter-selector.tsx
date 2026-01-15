"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Combo } from "@/components/ui/combo";
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ChapterSelectorProps {
    chapters: { value: string; label: string }[];
    value: string;
    className?: string;
}

export function ChapterSelector({
    chapters,
    value,
    className,
}: ChapterSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const selectedItemRef = React.useRef<HTMLDivElement>(null);

    const onChange = (value: string) => {
        router.push(`./${value}`);
        setOpen(false);
    };

    React.useEffect(() => {
        requestAnimationFrame(() => {
            if (open && selectedItemRef.current) {
                selectedItemRef.current.scrollIntoView({ block: "nearest" });
            }
        });
    }, [open]);

    return (
        <>
            <Combo
                options={chapters}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                aria-label="Select chapter"
                className={cn(
                    "mt-2 mb-2 h-9 w-auto w-full md:hidden",
                    className,
                )}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select chapter"
                        className={cn(
                            "w-52 justify-between hidden md:flex",
                            className,
                        )}
                    >
                        Select chapter...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    id="chapter-selector"
                    className="w-52 p-0 relative z-[2000]"
                >
                    <Command>
                        <CommandInput placeholder="Search chapter..." />
                        <CommandList data-scrollbar-custom>
                            <CommandEmpty>No chapter found.</CommandEmpty>
                            <CommandGroup>
                                {chapters.map((chapter) => (
                                    <CommandItem
                                        key={chapter.value}
                                        value={chapter.value}
                                        onSelect={onChange}
                                        className="cursor-pointer"
                                        ref={
                                            chapter.value === value
                                                ? selectedItemRef
                                                : null
                                        }
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
        </>
    );
}
