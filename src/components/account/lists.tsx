import { useState } from "react";
import { ListItem } from "./list-item";
import { ListCreate } from "../list/list-create";

interface UserMangaListsProps {
    initialLists: components["schemas"]["SuccessResponse_UserListResponse"]["data"][];
}

export function UserMangaLists({ initialLists }: UserMangaListsProps) {
    const [lists, setLists] = useState(initialLists);

    function handleDelete(listId: string) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Your Manga Lists
                </h2>
                <ListCreate setLists={setLists} />
            </div>
            {lists.length === 0 ? (
                <div>No lists found.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {lists.map((list) => (
                        <ListItem
                            key={list.id}
                            list={list}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
