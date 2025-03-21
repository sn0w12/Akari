import { Button } from "@/components/ui/button";
import { User, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <User className="h-8 w-8" />
                    Account Dashboard
                </h1>
                <Link href="/">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeftCircle className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
