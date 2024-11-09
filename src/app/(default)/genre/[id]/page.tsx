import GenrePage from "@/components/Genre";

interface PageProps {
    params: { id: string };
    searchParams: {
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    };
}

export default function Home({ params, searchParams }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <GenrePage
                params={{
                    id: params.id,
                }}
                searchParams={searchParams}
            />
        </div>
    );
}
