import AuthorPage from "@/components/Author";

interface PageProps {
    params: { id: string; sort?: string };
    searchParams: {
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    };
}

export default function Home({ params, searchParams }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AuthorPage
                params={{
                    id: params.id,
                }}
                searchParams={searchParams}
            />
        </div>
    );
}
