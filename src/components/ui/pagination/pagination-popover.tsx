import { Button } from "@/components/ui/button";
import {
    NumberField,
    NumberFieldDecrement,
    NumberFieldGroup,
    NumberFieldIncrement,
    NumberFieldInput,
} from "../number-field";
import {
    ResponsiveModal,
    ResponsiveModalPanel,
    ResponsiveModalPopup,
    ResponsiveModalTrigger,
} from "../responsive-modal";

interface JumpToPagePopoverProps {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    jumpToPage: number;
    setJumpToPage: (value: number) => void;
    isPopoverOpen: boolean;
    setIsPopoverOpen: (open: boolean) => void;
}

export function JumpToPagePopover({
    currentPage,
    totalPages,
    handlePageChange,
    jumpToPage,
    setJumpToPage,
    isPopoverOpen,
    setIsPopoverOpen,
}: JumpToPagePopoverProps) {
    const handleJumpToPage = () => {
        const page = jumpToPage;
        if (page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setIsPopoverOpen(false);
            setJumpToPage(page);
        }
    };

    return (
        <ResponsiveModal
            desktop="popover"
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
        >
            <ResponsiveModalTrigger>
                <Button
                    variant="default"
                    size="sm"
                    className="min-w-9 h-9"
                    aria-label={`Current page ${currentPage}, click to jump to page`}
                    aria-current="page"
                >
                    {currentPage}
                </Button>
            </ResponsiveModalTrigger>
            <ResponsiveModalPopup dialogClassName="w-42">
                <ResponsiveModalPanel>
                    <p className="text-xs text-muted-foreground text-center">
                        Jump to page
                    </p>
                    <div className="flex flex-col gap-1">
                        <NumberField
                            min={1}
                            max={totalPages}
                            value={jumpToPage}
                            onValueChange={(value) => setJumpToPage(value || 1)}
                            size="sm"
                            className="md:text-xs"
                        >
                            <NumberFieldGroup>
                                <NumberFieldDecrement />
                                <NumberFieldInput autoFocus />
                                <NumberFieldIncrement />
                            </NumberFieldGroup>
                        </NumberField>
                        <Button
                            size="sm"
                            onClick={handleJumpToPage}
                            disabled={
                                !jumpToPage ||
                                jumpToPage < 1 ||
                                jumpToPage > totalPages
                            }
                        >
                            Go
                        </Button>
                    </div>
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
