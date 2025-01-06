import { Metadata } from "next";
import nextBase64 from "next-base64";
import AuthorPage from "@/components/Author";

interface PageProps {
    params: Promise<{ id: string; sort?: string }>;
    searchParams: Promise<{
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const name = nextBase64
        .decode(params.id)
        .replaceAll("_", " ")
        .replaceAll("|", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const description = `View all manga by ${name}`;

    return {
        title: name,
        description: description,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title: name,
            description: description,
        },
        twitter: {
            title: name,
            description: description,
        },
    };
}

export default async function Home(props: PageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;
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
