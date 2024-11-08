"use client";

import { Combo } from "@/components/ui/combo";
import { useRouter, useSearchParams } from "next/navigation";

interface SortSelectProps {
    currentSort: string;
}

export function SortSelect({ currentSort }: SortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);

        // Preserve page parameter if it exists
        if (!params.has("page")) {
            params.set("page", "1");
        }

        router.push(`?${params.toString()}`);
    };

    return (
        <Combo
            value={currentSort}
            onChange={handleSortChange}
            className="max-w-48"
            options={[
                { value: "latest", label: "Latest" },
                { value: "topview", label: "Most Views" },
            ]}
        />
    );
}
