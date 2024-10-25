import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bookmark, Home, List, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    return (
        <Card
            className={`flex flex-col w-full h-[90vh] max-w-[600px] mx-auto my-8 ${className}`.trim()}
            style={style}
        >
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-grow space-y-6 text-center px-4">
                <div className="text-xl md:text-2xl font-semibold text-primary">
                    You&apos;ve reached the end!
                </div>
                <p className="text-muted-foreground">
                    This is the final chapter currently released. Check back
                    later for updates!
                </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button variant="outline" asChild onClick={handleClick}>
                        <Link href="/bookmarks">
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmarks
                        </Link>
                    </Button>
                    <Button variant="outline" asChild onClick={handleClick}>
                        <Link href={`/manga/${identifier}`}>
                            <List className="mr-2 h-4 w-4" />
                            Manga Page
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button variant="outline" asChild onClick={handleClick}>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Homepage
                        </Link>
                    </Button>
                    <Button variant="outline" asChild onClick={handleClick}>
                        <Link href="#" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
