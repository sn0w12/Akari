"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

interface CustomErrorProps {
    title?: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function ErrorComponent({
    title = "An error occurred",
    message,
    actionLabel,
    onAction,
}: CustomErrorProps) {
    const router = useRouter();
    if (!onAction && !actionLabel) {
        actionLabel = "Go back";
        onAction = () => router.back();
    }

    return (
        <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
            {actionLabel && onAction && (
                <Button
                    variant="outline"
                    className="mt-4 w-fit bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </Alert>
    );
}
