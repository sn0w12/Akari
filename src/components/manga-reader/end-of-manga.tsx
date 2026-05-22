import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bookmark, Home, List } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CSSProperties, MouseEvent } from "react";

interface EndOfMangaProps {
    title: string;
    identifier: string;
    style?: CSSProperties;
    className?: string;
}

export default function EndOfManga({
    title,
    identifier,
    style,
    className = "",
}: EndOfMangaProps) {
    const stopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    return (
        <Card
            className={`flex flex-col w-full h-[70svh] md:h-[90svh] mx-auto my-8 max-w-156 ${className}`.trim()}
            style={style}
        >
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-grow gap-y-6 text-center px-4">
                <div className="text-xl md:text-2xl font-semibold text-primary">
                    You&apos;ve reached the end!
                </div>
                <p className="text-muted-foreground">
                    This is the final chapter currently released. Check back
                    later for updates!
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-y-4">
                <div className="grid grid-cols-1 gap-4 w-full">
                    <Button variant="outline" render={<Link to="/bookmarks" />} onClick={stopPropagation}>
                        <Bookmark className="mr-2 size-4" />
                        Bookmarks
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button variant="outline" render={<Link to="/" />} onClick={stopPropagation}>
                        <Home className="mr-2 size-4" />
                        Homepage
                    </Button>
                    <Button variant="outline" render={<Link to="/manga/$id" params={{ id: identifier }} />} onClick={stopPropagation}>
                        <List className="mr-2 size-4" />
                        Manga Page
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
