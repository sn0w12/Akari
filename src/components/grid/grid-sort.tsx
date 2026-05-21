import { useRouter } from "@tanstack/react-router";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

type CurrentSort = { key: string; value: number };
type SortSeparator = { key: "separator" };
type SortItem = { key: string; value: number; label: string } | SortSeparator;

function isSeparator(item: SortItem): item is SortSeparator {
    return item.key === "separator";
}

export interface Sorting {
    currentSort: CurrentSort;
    sortItems: SortItem[];
    defaultSortValue?: number;
}

export function GridSortSelect({ sorting }: { sorting: Sorting }) {
    const router = useRouter();

    const onValueChange = (value: number | null) => {
        if (!value) return;
        const item = sorting.sortItems.find(
            (i) => !isSeparator(i) && i.value === value,
        );
        if (!item || isSeparator(item)) return;

        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(item.key, item.value.toString());
        const paramsString = searchParams.toString();
        router.navigate({
            to: `${window.location.pathname}?${paramsString}`,
            replace: true,
        });
    };

    const selectItems = sorting.sortItems
        .filter(
            (i): i is { key: string; value: number; label: string } =>
                !isSeparator(i),
        )
        .map(({ value, label }) => ({ value, label }));

    return (
        <Select
            items={selectItems}
            value={sorting.currentSort.value}
            defaultValue={sorting.defaultSortValue}
            onValueChange={onValueChange}
        >
            <SelectTrigger className="w-[180px]" aria-label="Sort By">
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="center">
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
