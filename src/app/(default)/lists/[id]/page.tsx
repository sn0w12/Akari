import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { ListComponent } from "@/components/list/list";

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

export default async function ListPage(props: PageProps) {
    const params = await props.params;

    return <ListComponent id={params.id} />;
}
