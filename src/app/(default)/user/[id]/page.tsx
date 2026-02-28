import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListsServer } from "@/components/user/user-lists-server";
import { UserListsSkeleton } from "@/components/user/user-lists-skeleton";
import { UserHeader } from "@/components/user/users-header";
import { client, serverHeaders } from "@/lib/api";
import { createMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const { id } = await props.params;
    const { data, error } = await client.GET("/v2/user/{userId}", {
        params: {
            path: {
                userId: id,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return {
            title: "User Not Found",
            description: "The requested user could not be found.",
        };
    }

    const user = data.data;

    return createMetadata({
        title: user.displayName || user.username,
        description:
            "View the profile of " + (user.displayName || user.username),
        canonicalPath: `/user/${id}`,
    });
}

export default async function UserPage(props: PageProps) {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full h-full">
            <Suspense fallback={<Skeleton className="h-16 md:h-10 w-full" />}>
                <UserHeader params={props.params} />
            </Suspense>
            <Separator className="my-2" />
            <Suspense fallback={<UserListsSkeleton />}>
                <UserListsServer params={props.params} />
            </Suspense>
        </div>
    );
}
