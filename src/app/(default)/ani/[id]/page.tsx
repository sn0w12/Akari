import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const { data, error } = await client.GET("/v2/manga/ani/{id}", {
        params: {
            path: {
                id: Number(id),
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    redirect(`/manga/${data.data.id}`);
}
