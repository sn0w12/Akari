"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { MessageCircle } from "lucide-react";
import { Button } from "../../ui/button";

interface CommentsButtonProps {
    chapterNumber: number;
    mangaType: components["schemas"]["MangaType"];
}

export function CommentsButton({
    chapterNumber,
    mangaType,
}: CommentsButtonProps) {
    const handleToggleComments = () => {
        const commentsElement = document.getElementById("comments");
        if (commentsElement) {
            commentsElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            {mangaType === "Manga" ? (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleComments}
                    className="h-7.5 md:h-9"
                >
                    <MessageCircle className="h-4 w-4" />
                </Button>
            ) : (
                <ButtonLink
                    variant="outline"
                    size="icon"
                    href={`./${chapterNumber}/comments`}
                    className="h-7.5 md:h-9"
                >
                    <MessageCircle className="h-4 w-4" />
                </ButtonLink>
            )}
        </>
    );
}
