import type { Metadata } from "next";
import { robots } from "@/lib/utils";
import { client } from "@/lib/api";
import { createClient as createSupabaseClient } from "@/lib/auth/server";
import ErrorPage from "@/components/error-page";
import BookmarksBody from "@/components/bookmarks/bookmarks-body";

interface BookmarksProps {
    searchParams: Promise<{
        page: string;
    }>;
}

export const metadata: Metadata = {
    title: "Bookmarks",
    description: "View and manage your bookmarked series",
    robots: robots(),
};

export default async function Bookmarks(props: BookmarksProps) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;

    const supabase = await createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await client.GET("/v2/bookmarks", {
        params: {
            query: {
                page: page,
            },
        },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    });

    if (error) {
        return <ErrorPage error={data} />;
    }

    return (
        <div className="h-full bg-background text-foreground">
            <div className="mx-auto p-4 h-full">
                <BookmarksBody
                    bookmarks={data.data.items}
                    page={page}
                    totalPages={data.data.totalPages}
                />
            </div>
        </div>
    );
}
