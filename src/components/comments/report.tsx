"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/api";
import Toast from "@/lib/toast-wrapper";
import { useState } from "react";

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
    const [reason, setReason] = useState<
        components["schemas"]["CommentReportReason"] | null
    >(null);
    const [details, setDetails] = useState("");

    const handleReport = async () => {
        if (!reason) return;

        try {
            const { error } = await client.POST(
                "/v2/comments/{commentId}/report",
                {
                    params: {
                        path: { commentId },
                    },
                    body: {
                        reason,
                        description: details || undefined,
                    },
                },
            );

            if (error) {
                new Toast("Failed to report comment.", "error");
                return;
            }

            new Toast("Comment reported successfully.", "success");
        } finally {
            setReason(null);
            setDetails("");
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        setReason(null);
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
                        <Select
                            value={reason || ""}
                            onValueChange={(value) =>
                                setReason(
                                    value === ""
                                        ? null
                                        : (value as components["schemas"]["CommentReportReason"]),
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent align="center">
                                <SelectItem value="spam">
                                    Spam or irrelevant content
                                </SelectItem>
                                <SelectItem value="harassment">
                                    Harassment or bullying
                                </SelectItem>
                                <SelectItem value="inappropriate">
                                    Inappropriate content
                                </SelectItem>
                                <SelectItem value="hate_speech">
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
                            className="min-h-[80px] resize-none"
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
