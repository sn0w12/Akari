import { client, serverHeaders } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import ErrorPage from "@/components/error-page";
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
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { cacheLife, cacheTag } from "next/cache";

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

async function getUserData(userId: string, accesToken: string | undefined) {
    "use cache";
    cacheLife("default");
    cacheTag("user-profiles", `user-${userId}`);

    const { data, error } = await client.GET("/v2/user/{userId}", {
        params: {
            path: {
                userId,
            },
        },
        headers: {
            Authorization: accesToken ? `Bearer ${accesToken}` : undefined,
            ...serverHeaders,
        },
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

export async function UserHeader({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const token = await getAuthToken();

    const { data, error } = await getUserData(id, token);

    if (error) {
        return <ErrorPage title="Failed to load user" error={error} />;
    }

    const userScore = data.data.totalUpvotes - data.data.totalDownvotes;
    return (
        <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-baseline">
                <Avatar name={data.data.username} />
                <h2 className="text-4xl font-bold">
                    {data.data.displayName || data.data.username}
                </h2>
                <p className="text-muted-foreground">@{data.data.username}</p>
                {data.data.banned ? (
                    <Badge className="self-center mt-2" variant="destructive">
                        Banned
                    </Badge>
                ) : null}
            </div>
            <div className="flex flex-row divide-x font-medium">
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
    );
}
