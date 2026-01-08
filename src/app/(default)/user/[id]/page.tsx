import { Metadata } from "next";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { UserHeader } from "@/components/user/users-header";
import { UserListsServer } from "@/components/user/use-lists-server";

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
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 h-full">
            <UserHeader params={props.params} />
            <Separator className="my-2" />
            <UserListsServer params={props.params} />
        </div>
    );
}
