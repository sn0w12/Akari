"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { Flag } from "lucide-react";
import { useState } from "react";

export function ReportMalLink({ mangaId }: { mangaId: string }) {
    const [isReported, setIsReported] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleReport = async () => {
        try {
            const response = await fetch(`/api/mal/report`, {
                method: "POST",
                body: JSON.stringify({ mangaId }),
            });
            if (response.ok) {
                setIsReported(true);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Failed to report MAL link:", error);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="hover:text-destructive transition-colors w-10 h-10 p-0"
                            >
                                <Flag className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Report incorrect MAL link</p>
                    </TooltipContent>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report MAL Link</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to report this MyAnimeList
                                link as incorrect? This will help us maintain
                                accurate information.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReport}
                                disabled={isReported}
                            >
                                {isReported ? "Reported" : "Report Link"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tooltip>
        </TooltipProvider>
    );
}
