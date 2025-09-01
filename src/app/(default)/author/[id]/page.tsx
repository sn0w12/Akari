import { Metadata } from "next";
import AuthorPage from "@/components/Author";
import { unstable_cacheLife as cacheLife } from "next/cache";

interface PageProps {
    params: Promise<{ id: string; sort?: string }>;
    searchParams: Promise<{
        page: string;
        sort?: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
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
