import { Input } from "@/components/ui/input";
import { FilterIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function SearchPageSkeleton() {
    return (
        <div className="px-4 pt-4">
            <div className="flex gap-2 mb-4">
                <Input
                    type="search"
                    placeholder="Search manga..."
                    className="w-full p-2 mb-4"
                    disabled
                />
                <Button variant="outline">
                    <FilterIcon className="w-4 h-4" />
                    Filter
                </Button>
            </div>
        </div>
    );
}
