"use client";

import { useStorage } from "@/lib/storage";
import { useState } from "react";
import {
    Prompt,
    PromptContent,
    PromptHeader,
    PromptTitle,
} from "../ui/prompt-stack";

interface RemotePromptProps {
    id: number;
    title: string;
    content: string;
}

export function RemotePrompt({ id, title, content }: RemotePromptProps) {
    const promptStorage = useStorage("remotePrompt", { id: id.toString() });
    const [isVisible, setIsVisible] = useState<boolean | null>(() => {
        if (typeof window === "undefined") return null;
        const stored = promptStorage.get();
        return !(stored?.dismissed ?? false);
    });

    const handleClose = () => {
        promptStorage.set({ dismissed: true });
        setIsVisible(false);
    };

    if (isVisible === null || isVisible === false) return null;

    return (
        <Prompt>
            <PromptHeader onDecline={handleClose}>
                <PromptTitle>{title}</PromptTitle>
            </PromptHeader>
            <PromptContent>{content}</PromptContent>
        </Prompt>
    );
}
