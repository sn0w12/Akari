import { Input } from "@/components/ui/input";
import SettingsSkeleton from "@/components/ui/Settings/skeleton";
import { Search } from "lucide-react";

export default async function Loading() {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="settings-container">
                {/* Skeleton shown during SSR */}
                <div className="settings-skeleton">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search settings..."
                            disabled={true}
                            className="pl-10"
                        />
                    </div>
                    <SettingsSkeleton />
                </div>
            </div>
        </div>
    );
}
