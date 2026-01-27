import ErrorPage from "@/components/error-page";
import { Avatar } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { client, serverHeaders } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import {
    Bookmark,
    ImageIcon,
    MessageCircle,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { Badge, BadgeVariantProps } from "../ui/badge";

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

async function getUserData(userId: string) {
    "use cache";
    cacheLife("default");
    cacheTag("user-profiles", `user-${userId}`);

    const { data, error } = await client.GET("/v2/user/{userId}", {
        params: {
            path: {
                userId,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

const ROLE_VARIANT_MAP: Record<
    components["schemas"]["UserRole"],
    BadgeVariantProps["variant"]
> = {
    user: "default",
    admin: "info",
    moderator: "positive",
    owner: "warning",
};

export async function UserHeader({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { data, error } = await getUserData(id);

    if (error) {
        return <ErrorPage title="Failed to load user" error={error} />;
    }

    const userScore = data.data.totalUpvotes - data.data.totalDownvotes;
    return (
        <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-baseline md:gap-2">
                <div className="flex flex-row gap-2 items-baseline">
                    <Avatar name={data.data.username} />
                    <h2 className="text-4xl font-bold">
                        {data.data.displayName || data.data.username}
                    </h2>
                </div>
                <div className="flex flex-row gap-2 items-baseline">
                    <p className="text-muted-foreground leading-right">
                        @{data.data.username}
                    </p>
                    {data.data.banned ? (
                        <Badge className="self-center" variant="destructive">
                            Banned
                        </Badge>
                    ) : null}
                    {data.data.role !== "user" ? (
                        <Badge className="self-center" variant={ROLE_VARIANT_MAP[data.data.role]}>
                            {capitalize(data.data.role)}
                        </Badge>
                    ) : null}
                </div>
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
