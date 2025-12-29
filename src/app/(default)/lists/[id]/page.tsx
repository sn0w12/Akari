import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { ListComponent } from "@/components/list/list";
import { Suspense } from "react";
import { UserListsSkeleton } from "@/components/user/use-lists-server";

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
        <Suspense fallback={<UserListsSkeleton />}>
            <ListPageContent params={props.params} />
        </Suspense>
    );
}
