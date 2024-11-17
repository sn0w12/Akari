import { MangaDetailsComponent } from "@/components/MangaDetails";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MangaDetailsComponent id={params.id} />
        </div>
    );
}
