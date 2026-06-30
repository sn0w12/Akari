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
import { Form } from "../form";
import { Field, FieldLabel } from "../field";
import { FormEvent } from "react";

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
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const page = Number(formData.get("page"));
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
                    <Form className="flex flex-col gap-1" onSubmit={onSubmit}>
                        <Field name="page" className="gap-1">
                            <FieldLabel className="block w-full text-center md:text-xs">
                                Jump to page
                            </FieldLabel>
                            <NumberField
                                min={1}
                                max={totalPages}
                                value={jumpToPage}
                                onValueChange={(value) =>
                                    setJumpToPage(value || 1)
                                }
                                size="sm"
                                className="md:text-xs"
                                required
                            >
                                <NumberFieldGroup>
                                    <NumberFieldDecrement />
                                    <NumberFieldInput autoFocus type="number" />
                                    <NumberFieldIncrement />
                                </NumberFieldGroup>
                            </NumberField>
                        </Field>
                        <Button
                            size="sm"
                            type="submit"
                            disabled={
                                !jumpToPage ||
                                jumpToPage < 1 ||
                                jumpToPage > totalPages
                            }
                        >
                            Go
                        </Button>
                    </Form>
                </ResponsiveModalPanel>
            </ResponsiveModalPopup>
        </ResponsiveModal>
    );
}
