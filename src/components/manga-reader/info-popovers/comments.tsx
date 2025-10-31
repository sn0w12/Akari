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
        <Button variant="outline" size="icon" onClick={handleScrollToComments}>
            <MessageCircle className="h-4 w-4" />
        </Button>
    );
}
