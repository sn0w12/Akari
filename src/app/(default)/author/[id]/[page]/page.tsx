import { Metadata } from "next";
import Page, {
    generateMetadata as parentGenerateMetadata,
    generateStaticParams as parentGenerateStaticParams,
} from "../page";

interface AuthorPageProps {
    params: Promise<{ id: string; page: string }>;
}

export async function generateStaticParams() {
    const params = await parentGenerateStaticParams();
    return params.map((p) => ({ ...p, page: "2" }));
}

export async function generateMetadata(
    props: AuthorPageProps,
): Promise<Metadata> {
    return parentGenerateMetadata(props);
}

export default async function AuthorPage(props: AuthorPageProps) {
    return <Page {...props} />;
}
