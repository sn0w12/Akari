import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

export function CommentSorting({
    sort,
    onSortChange,
}: {
    sort: components["schemas"]["CommentSortOrder"];
    onSortChange: (newSort: components["schemas"]["CommentSortOrder"]) => void;
}) {
    return (
        <Select
            value={sort}
            onValueChange={(value) =>
                onSortChange(value as components["schemas"]["CommentSortOrder"])
            }
        >
            <SelectTrigger className="min-w-36" aria-label="Sort Comments">
                {sort === "Latest" ? "Latest" : "Most Upvoted"}
            </SelectTrigger>
            <SelectContent align="center">
                <SelectItem value="Latest">Latest</SelectItem>
                <SelectItem value="Upvoted">Most Upvoted</SelectItem>
            </SelectContent>
        </Select>
    );
}
