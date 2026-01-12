"use client";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectSeparator,
} from "../ui/select";
import { useRouter } from "next/navigation";

type CurrentSort = { key: string; value: string };
type SortSeparator = { key: "separator" };
type SortItem = { key: string; value: string; label: string } | SortSeparator;

function isSeparator(item: SortItem): item is SortSeparator {
    return item.key === "separator";
}

export interface Sorting {
    currentSort: CurrentSort;
    sortItems: SortItem[];
    defaultSortValue?: string;
}

export function GridSortSelect({ sorting }: { sorting: Sorting }) {
    const router = useRouter();

    const onValueChange = (value: string) => {
        const item = sorting.sortItems.find(
            (i) => !isSeparator(i) && i.value === value,
        );
        if (!item || isSeparator(item)) return;

        router.push(`?${item.key}=${item.value}`);
    };

    return (
        <Select
            value={sorting.currentSort.value}
            defaultValue={sorting.defaultSortValue}
            onValueChange={onValueChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
                {sorting.sortItems.map((item, index) =>
                    isSeparator(item) ? (
                        <SelectSeparator key={`separator-${index}`} />
                    ) : (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ),
                )}
            </SelectContent>
        </Select>
    );
}
