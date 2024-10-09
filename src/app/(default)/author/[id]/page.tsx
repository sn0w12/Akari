import AuthorPage from "@/components/Author";

interface PageProps {
    params: { id: string };
}

export default function Home({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AuthorPage
                params={{
                    id: params.id,
                }}
            />
        </div>
    );
}
