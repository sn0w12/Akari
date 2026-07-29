import { useState } from "react";
import {
    ResponsiveModal,
    ResponsiveModalHeader,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTitle,
    ResponsiveModalTrigger,
} from "../ui/responsive-modal";
import { Button } from "../ui/button";
import { CreateListForm } from "../account/create-list-form";

interface ListCreateProps {
    setLists?: React.Dispatch<
        React.SetStateAction<
            components["schemas"]["SuccessResponse_UserListResponse"]["data"][]
        >
    >;
    onSuccess?: (
        list: components["schemas"]["SuccessResponse_UserListResponse"]["data"],
    ) => void;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean;
}

export function ListCreate({
    setLists,
    onSuccess,
    className,
    open: openProp,
    onOpenChange,
    showTrigger = true,
}: ListCreateProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;

    function setOpen(nextOpen: boolean) {
        if (openProp === undefined) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    }

    function handleSuccess(
        list: components["schemas"]["SuccessResponse_UserListResponse"]["data"],
    ) {
        if (setLists) {
            setLists((prev) => [...prev, list]);
        }
        onSuccess?.(list);
        setOpen(false);
    }

    return (
        <ResponsiveModal open={open} onOpenChange={setOpen}>
            {showTrigger ? (
                <ResponsiveModalTrigger
                    render={<Button variant="outline" className={className} />}
                >
                    Create List
                </ResponsiveModalTrigger>
            ) : null}
            <ResponsiveModalPopup>
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle>Create New List</ResponsiveModalTitle>
                </ResponsiveModalHeader>
                <ResponsiveModalPanel>
                    <CreateListForm
                        onSuccess={handleSuccess}
                        onClose={() => setOpen(false)}
                    />
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
