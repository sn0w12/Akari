import {
    ResponsiveModal,
    ResponsiveModalHeader,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
    ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateListForm } from "./create-list-form";
import { ListItem } from "./list-item";

interface UserMangaListsProps {
    initialLists: components["schemas"]["UserMangaListResponse"][];
}

export function UserMangaLists({ initialLists }: UserMangaListsProps) {
    const [lists, setLists] = useState(initialLists);
    const [open, setOpen] = useState(false);

    function handleSuccess(
        list: components["schemas"]["UserMangaListResponse"],
    ) {
        setLists((prev) => [...prev, list]);
        setOpen(false);
    }

    function handleDelete(listId: string) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    Your Manga Lists
                </h2>
                <ResponsiveModal open={open} onOpenChange={setOpen}>
                    <ResponsiveModalTrigger
                        render={<Button variant="outline" />}
                    >
                        Create List
                    </ResponsiveModalTrigger>
                    <ResponsiveModalPopup>
                        <ResponsiveModalHeader>
                            <ResponsiveModalTitle>
                                Create New List
                            </ResponsiveModalTitle>
                        </ResponsiveModalHeader>
                        <ResponsiveModalPanel>
                            <CreateListForm
                                onSuccess={handleSuccess}
                                onClose={() => setOpen(false)}
                            />
                        </ResponsiveModalPanel>
                    </ResponsiveModalPopup>
                </ResponsiveModal>
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
