import { Metadata } from "next";
import { createMetadata, getInitials } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import { createClient as createSupabaseClient } from "@/lib/auth/server";
import ErrorPage from "@/components/error-page";
import { UserLists } from "@/components/user/user-lists";

import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipProvider,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    MessageCircle,
    TrendingUp,
    TrendingDown,
    ImageIcon,
    Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

interface UserStatProps {
    icon: React.ReactElement;
    label: string;
    value: number;
}

function UserStat({ icon, label, value }: UserStatProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex flex-row items-center gap-0.5 pr-1 pl-0.5">
                    {icon}
                    <span>{value}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default async function UserPage(props: PageProps) {
    const { id } = await props.params;
    const supabase = await createSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await client.GET("/v2/user/{userId}", {
        params: {
            path: {
                userId: id,
            },
        },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
            ...serverHeaders,
        },
    });

    if (error) {
        return <ErrorPage title="Failed to load user" error={error} />;
    }

    const userScore = data.data.totalUpvotes - data.data.totalDownvotes;
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 h-full">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-baseline">
                    <Avatar
                        name={data.data.displayName}
                        className="size-8 shrink-0 self-center"
                    >
                        <AvatarFallback className="text-xs">
                            {getInitials(data.data.displayName)}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-4xl font-bold">
                        {data.data.displayName || data.data.username}
                    </h2>
                    <p className="text-muted-foreground">
                        @{data.data.username}
                    </p>
                </div>
                <div className="flex flex-row divide-x font-medium font-mono">
                    <TooltipProvider>
                        <UserStat
                            icon={<Bookmark className="size-5" />}
                            label="Bookmarks"
                            value={data.data.totalBookmarks}
                        />
                        <UserStat
                            icon={<MessageCircle className="size-5" />}
                            label="Comments"
                            value={data.data.totalComments}
                        />
                        <UserStat
                            icon={
                                userScore >= 0 ? (
                                    <TrendingUp className="size-5 text-accent-positive" />
                                ) : (
                                    <TrendingDown className="size-5 text-negative" />
                                )
                            }
                            label="Comment Score"
                            value={userScore}
                        />
                        <UserStat
                            icon={<ImageIcon className="size-5" />}
                            label="Attachments"
                            value={data.data.totalUploads}
                        />
                    </TooltipProvider>
                </div>
            </div>
            <Separator className="my-2" />
            <UserLists userId={id} />
        </div>
    );
}
