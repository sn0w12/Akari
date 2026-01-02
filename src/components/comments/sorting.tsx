import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/select";

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
            <SelectTrigger className="min-w-36">
                {sort === "Latest" ? "Latest" : "Most Upvoted"}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Latest">Latest</SelectItem>
                <SelectItem value="Upvoted">Most Upvoted</SelectItem>
            </SelectContent>
        </Select>
    );
}
