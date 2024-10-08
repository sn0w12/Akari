import { HeaderComponent } from "@/components/Header";
import AuthorPage from "@/components/Author";

interface PageProps {
    params: { id: string };
}

export default function Home({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeaderComponent />
            <AuthorPage
                params={{
                    id: params.id,
                }}
            />
        </div>
    );
}
