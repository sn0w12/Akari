import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserListsSkeleton } from "@/components/user/use-lists-server";

export default async function UserLoading() {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 h-full">
            <Skeleton className="h-10 w-full" />
            <Separator className="my-2" />
            <UserListsSkeleton />
        </div>
    );
}
