import BookmarksPage from "@/components/Bookmarks";

interface BookmarksProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Bookmarks(props: BookmarksProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <BookmarksPage page={Number(searchParams.page) || 1} />
        </div>
    );
}
