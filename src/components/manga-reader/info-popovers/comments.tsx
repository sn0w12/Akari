"use client";

import { Button } from "../../ui/button";
import { MessageCircle } from "lucide-react";

export function CommentsButton() {
    const handleScrollToComments = () => {
        const commentsElement = document.getElementById("comments");
        if (commentsElement) {
            commentsElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleScrollToComments}
            className="h-7.5 md:h-9"
        >
            <MessageCircle className="h-4 w-4" />
        </Button>
    );
}
