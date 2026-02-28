"use client";

import { Button } from "@/components/ui/button";
import { ErrorData, useError } from "@/contexts/error-context";
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    Clock,
    Home,
    Lock,
    RefreshCw,
    Search,
    ServerCrash,
    ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ValidationError {
    errors: { id: string[] };
    status: number;
    title: string;
    traceId: string;
    type: string;
}

type ErrorResponse = components["schemas"]["ErrorResponse"] | ValidationError;

interface CustomErrorProps {
    error: ErrorResponse | undefined;
}

export default function ErrorPage({ error }: CustomErrorProps) {
    const { setError } = useError();

    useEffect(() => {
        setError(
            error ?? {
                result: "Error",
                status: 500,
                data: {
                    message: "An unexpected error occurred.",
                    details: null,
                },
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

interface StatusInfo {
    title: string;
    explanation: string;
    icon: React.ReactNode;
    suggestion: string;
}

function getStatusInfo(status: number): StatusInfo {
    const iconClass = "size-6";

    const map: Record<number, StatusInfo> = {
        400: {
            title: "Bad Request",
            explanation:
                "The server couldn't understand the request due to invalid syntax or missing information. This usually means something was wrong with the data sent.",
            icon: <AlertCircle className={iconClass} />,
            suggestion: "Double-check the data you submitted and try again.",
        },
        401: {
            title: "Unauthorized",
            explanation:
                "You need to be logged in to access this resource. Your session may have expired or you haven't provided valid credentials.",
            icon: <Lock className={iconClass} />,
            suggestion: "Try logging in again or check your credentials.",
        },
        403: {
            title: "Forbidden",
            explanation:
                "You don't have permission to access this resource. Even though you may be logged in, your account doesn't have the required access level.",
            icon: <ShieldAlert className={iconClass} />,
            suggestion:
                "Contact an administrator if you believe this is a mistake.",
        },
        404: {
            title: "Not Found",
            explanation:
                "The page or resource you're looking for doesn't exist. It may have been moved, deleted, or the URL might be incorrect.",
            icon: <Search className={iconClass} />,
            suggestion:
                "Check the URL for typos or navigate back to a known page.",
        },
        405: {
            title: "Method Not Allowed",
            explanation:
                "The request method used is not supported for this resource. For example, trying to submit data to a read-only endpoint.",
            icon: <Ban className={iconClass} />,
            suggestion: "Verify you're using the correct action for this page.",
        },
        408: {
            title: "Request Timeout",
            explanation:
                "The server timed out waiting for your request to complete. This can happen with slow connections or when the server is under heavy load.",
            icon: <Clock className={iconClass} />,
            suggestion: "Check your internet connection and try again.",
        },
        429: {
            title: "Too Many Requests",
            explanation:
                "You've sent too many requests in a short period of time. The server is rate-limiting your access to protect the service.",
            icon: <Ban className={iconClass} />,
            suggestion: "Wait a moment before trying again.",
        },
        500: {
            title: "Internal Server Error",
            explanation:
                "Something went wrong on the server's side. This isn't caused by anything you did — the server encountered an unexpected condition.",
            icon: <ServerCrash className={iconClass} />,
            suggestion:
                "Try refreshing the page. If the issue persists, it should be resolved soon.",
        },
        502: {
            title: "Bad Gateway",
            explanation:
                "The server received an invalid response from an upstream server. This is typically a temporary infrastructure issue.",
            icon: <ServerCrash className={iconClass} />,
            suggestion: "Wait a moment and refresh the page.",
        },
        503: {
            title: "Service Unavailable",
            explanation:
                "The server is temporarily unable to handle the request, usually due to maintenance or being overloaded.",
            icon: <ServerCrash className={iconClass} />,
            suggestion:
                "The service should be back shortly. Try again in a few minutes.",
        },
        504: {
            title: "Gateway Timeout",
            explanation:
                "The server didn't receive a timely response from another server it needed to complete the request.",
            icon: <Clock className={iconClass} />,
            suggestion: "Try again in a moment — this is usually temporary.",
        },
    };

    if (map[status]) return map[status];

    if (status >= 400 && status < 500) {
        return {
            title: "Client Error",
            explanation:
                "There was a problem with the request. The server couldn't process it due to an issue on the client side.",
            icon: <AlertCircle className={iconClass} />,
            suggestion: "Review your request and try again.",
        };
    }

    if (status >= 500) {
        return {
            title: "Server Error",
            explanation:
                "The server encountered an error and couldn't complete the request. This is not caused by anything you did.",
            icon: <ServerCrash className={iconClass} />,
            suggestion: "Try refreshing the page or come back later.",
        };
    }

    return {
        title: "Unexpected Error",
        explanation:
            "An unexpected error occurred. We're not sure what went wrong.",
        icon: <AlertCircle className={iconClass} />,
        suggestion: "Try refreshing the page or navigating back.",
    };
}

export function ErrorComponent({ message, details, status }: ErrorData) {
    const info = getStatusInfo(status);

    return (
        <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-lg px-4">
            {/* Status code */}
            <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex size-10 items-center justify-center rounded-lg bg-card text-foreground border border-border">
                    {info.icon}
                </div>
                <span className="font-mono text-sm tracking-wider">
                    {"ERROR"} {status}
                </span>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground text-balance">
                {info.title}
            </h1>

            {/* Friendly explanation */}
            <p className="mt-3 leading-relaxed text-muted-foreground">
                {info.explanation}
            </p>

            {/* Original error message */}
            <div className="mt-6 rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{message}</p>
                {details && (
                    <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {details}
                    </p>
                )}
            </div>

            {/* Suggestion */}
            <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                    {"What to do: "}
                </span>
                {info.suggestion} If the issue persists, please consider
                reporting it on{" "}
                <Link
                    className="text-foreground hover:underline"
                    href="https://github.com/sn0w12/akari/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </Link>
                .
            </p>

            {/* Divider */}
            <div className="mt-8 h-px bg-border" />

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw className="size-4" />
                    Try Again
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="size-4" />
                    Go Back
                </Button>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <Home className="size-4" />
                        Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
