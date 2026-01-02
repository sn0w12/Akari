"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReportCommentDialogProps {
    commentId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportCommentDialog({
    commentId,
    isOpen,
    onOpenChange,
}: ReportCommentDialogProps) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const handleReport = () => {
        // For now, just log the report details
        console.log("Reporting comment", commentId, { reason, details });
        // Reset form and close dialog
        setReason("");
        setDetails("");
        onOpenChange(false);
    };

    const handleCancel = () => {
        setReason("");
        setDetails("");
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] gap-2">
                <DialogHeader className="border-b pb-2">
                    <DialogTitle>Report Comment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for reporting</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="spam">
                                    Spam or irrelevant content
                                </SelectItem>
                                <SelectItem value="harassment">
                                    Harassment or bullying
                                </SelectItem>
                                <SelectItem value="inappropriate">
                                    Inappropriate content
                                </SelectItem>
                                <SelectItem value="hate-speech">
                                    Hate speech
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="details">
                            Additional details (optional)
                        </Label>
                        <Textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide more details about why you're reporting this comment..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleReport} disabled={!reason}>
                        Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
