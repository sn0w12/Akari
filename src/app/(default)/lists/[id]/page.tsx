import { ListComponent } from "@/components/list/list";
import { ListSkeleton } from "@/components/list/list-skeleton";
import { createMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;

    return createMetadata({
        title: "Manga List",
        description: "",
        canonicalPath: `/lists/${params.id}`,
    });
}

async function ListPageContent({ params }: PageProps) {
    const { id } = await params;
    return <ListComponent id={id} />;
}

export default function ListPage(props: PageProps) {
    return (
        <div className="flex-1">
            <Suspense fallback={<ListSkeleton />}>
                <ListPageContent params={props.params} />
            </Suspense>
        </div>
    );
}
