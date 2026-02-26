"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface PromptStackProps {
    children: ReactNode;
}

export function PromptStack({ children }: PromptStackProps) {
    return (
        <div className="fixed bottom-2 left-0 right-0 md:bottom-4 md:right-4 md:left-auto z-50 flex flex-col-reverse gap-4">
            {children}
        </div>
    );
}

export function Prompt({ children }: { children: ReactNode }) {
    return (
        <div className="bg-background border rounded-lg p-4 shadow-lg w-full sm:max-w-sm">
            {children}
        </div>
    );
}

export function PromptHeader({
    children,
    onDecline,
}: {
    children: ReactNode;
    onDecline?: () => void;
}) {
    return (
        <div className="flex justify-between items-start mb-2">
            {children}
            {onDecline && (
                <button
                    onClick={onDecline}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close prompt"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}

export function PromptTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function PromptContent({ children }: { children: ReactNode }) {
    return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function PromptActions({ children }: { children: ReactNode }) {
    return <div className="flex gap-2 mt-3">{children}</div>;
}
