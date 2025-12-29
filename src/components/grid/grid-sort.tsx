"use client";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "../ui/select";
import { useRouter } from "next/navigation";

type CurrentSort = { key: string; value: string };
type SortItem = { key: string; value: string; label: string };

export interface Sorting {
    currentSort: CurrentSort;
    sortItems: SortItem[];
    defaultSortValue?: string;
}

export function GridSortSelect({ sorting }: { sorting: Sorting }) {
    const router = useRouter();

    const onValueChange = (value: string) => {
        const item = sorting.sortItems.find((i) => i.value === value);
        if (item) {
            router.push(`?${item.key}=${item.value}`);
        }
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
                {sorting.sortItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
