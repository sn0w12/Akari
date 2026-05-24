import { Image } from "@/components/image";
import { AutocompleteItem } from "@/components/ui/autocomplete";

interface SearchItemProps {
    cover: string;
    title: string;
    subtitle: string;
    value: unknown;
    onSelect: () => void;
}

export function SearchItem({
    cover,
    title,
    subtitle,
    value,
    onSelect,
}: SearchItemProps) {
    return (
        <AutocompleteItem
            className="flex items-center gap-1 cursor-pointer"
            value={value}
            onClick={onSelect}
        >
            <Image
                src={cover}
                alt={title}
                className="max-h-10 w-auto rounded"
                height={60}
                width={40}
                sizes={{ default: "40px" }}
                quality={40}
            />
            <div className="flex flex-col">
                <span className="font-medium">{title}</span>
                <span className="text-muted-foreground text-xs">
                    {subtitle}
                </span>
            </div>
        </AutocompleteItem>
    );
}
