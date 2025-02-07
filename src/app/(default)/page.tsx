import MangaReaderHome from "@/components/Home";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Home(props: HomeProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MangaReaderHome searchParams={searchParams} />
        </div>
    );
}
