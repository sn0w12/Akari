"use client";

import { ReactNode } from "react";

interface PromptStackProps {
    children: ReactNode;
}

export function PromptStack({ children }: PromptStackProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto z-50 flex flex-col-reverse gap-4">
            {children}
        </div>
    );
}
