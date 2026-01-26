"use client";

import { useWindowWidth } from "@/hooks/use-window-width";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";

export function CommentsButton() {
    const [savedScrollPosition, setSavedScrollPosition] = useState<
        number | null
    >(null);
    const [isAtComments, setIsAtComments] = useState(false);
    const [scrollElement, setScrollElement] = useState<HTMLElement | Window>(
        typeof window !== "undefined" ? window : ({} as Window),
    );
    const windowWidth = useWindowWidth();

    useEffect(() => {
        if (windowWidth < 768) {
            setScrollElement(window);
        } else {
            const el = document.getElementById("scroll-element") as HTMLElement;
            setScrollElement(el || window);
        }
    }, [windowWidth]);

    const handleToggleComments = () => {
        if (isAtComments && savedScrollPosition !== null) {
            // Return to saved position
            scrollElement.scrollTo({
                top: savedScrollPosition,
                behavior: "smooth",
            });
            setSavedScrollPosition(null);
            setIsAtComments(false);
        } else {
            // Save current position and scroll to comments
            const currentScroll =
                scrollElement === window
                    ? window.scrollY
                    : (scrollElement as HTMLElement).scrollTop;
            setSavedScrollPosition(currentScroll);

            const commentsElement = document.getElementById("comments");
            if (commentsElement) {
                commentsElement.scrollIntoView({ behavior: "smooth" });
                setIsAtComments(true);
            }
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggleComments}
            className="h-7.5 md:h-9"
        >
            {isAtComments ? (
                <ArrowUp className="h-4 w-4" />
            ) : (
                <MessageCircle className="h-4 w-4" />
            )}
        </Button>
    );
}
