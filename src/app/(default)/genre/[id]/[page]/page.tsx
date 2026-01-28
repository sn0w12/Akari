import { Metadata } from "next";
import Page, {
    generateMetadata as parentGenerateMetadata,
    generateStaticParams as parentGenerateStaticParams,
} from "../page";

interface PageProps {
    params: Promise<{ id: string, page: string }>;
    searchParams: Promise<{
        sort?: string;
    }>;
}

export async function generateStaticParams() {
    const params = await parentGenerateStaticParams();
    return params.map((p) => ({ ...p, page: "2" }));
}

export async function generateMetadata(
    props: PageProps,
): Promise<Metadata> {
    return parentGenerateMetadata(props);
}

export default async function GenrePage(props: PageProps) {
    return <Page {...props} />;
}
