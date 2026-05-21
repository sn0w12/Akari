import { ButtonLink } from "@/components/ui/button-link";
import { MessageCircle } from "lucide-react";
import { Button } from "../../ui/button";

interface CommentsButtonProps {
    mangaType: components["schemas"]["MangaType"];
}

export function CommentsButton({ mangaType }: CommentsButtonProps) {
    const handleToggleComments = () => {
        if (typeof window === "undefined") return;
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
                    className="size-7.5 md:size-9"
                >
                    <MessageCircle />
                </Button>
            ) : (
                <ButtonLink
                    variant="outline"
                    size="icon"
                    href={`./comments`}
                    className="size-7.5 md:size-9"
                >
                    <MessageCircle />
                </ButtonLink>
            )}
        </>
    );
}
