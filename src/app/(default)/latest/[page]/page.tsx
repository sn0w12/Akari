import { Metadata } from "next";
import Page, { generateMetadata as parentGenerateMetadata } from "../page";

interface PageProps {
    params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
    return [{ page: "2" }];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    return parentGenerateMetadata(props);
}

export default async function LatestPage(props: PageProps) {
    return <Page {...props} />;
}
