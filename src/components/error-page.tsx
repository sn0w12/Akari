"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

interface CustomErrorProps {
    title?: string;
    error?: components["schemas"]["ErrorResponse"];
}

export default function ErrorPage({
    title = "An error occurred",
    error,
}: CustomErrorProps) {
    const router = useRouter();
    const actionLabel = "Go back";

    const message = error?.data?.message || "An unexpected error occurred.";
    const statusText = error?.status ? ` (Status: ${error.status})` : "";

    return (
        <div className="flex align-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md mx-auto h-fit">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                    {title}
                    {statusText}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
                <Button
                    variant="outline"
                    className="mt-4 w-fit bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => router.back()}
                >
                    {actionLabel}
                </Button>
            </Alert>
        </div>
    );
}
