import {
    Select,
    SelectItem,
    SelectPopup,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

const items = [
    { value: "Latest", label: "Latest" },
    { value: "Upvoted", label: "Most Upvoted" },
];

export function CommentSorting({
    sort,
    onSortChange,
}: {
    sort: components["schemas"]["CommentSortOrder"];
    onSortChange: (newSort: components["schemas"]["CommentSortOrder"]) => void;
}) {
    return (
        <Select
            items={items}
            value={sort}
            onValueChange={(value) =>
                onSortChange(value as components["schemas"]["CommentSortOrder"])
            }
        >
            <SelectTrigger className="w-48 md:w-36" aria-label="Sort Comments">
                <SelectValue />
            </SelectTrigger>
            <SelectPopup align="center">
                {items.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                        {label}
                    </SelectItem>
                ))}
            </SelectPopup>
        </Select>
    );
}
