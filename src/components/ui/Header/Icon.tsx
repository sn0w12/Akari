import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Icon() {
    return (
        <Card>
            <Button
                variant="ghost"
                size="icon"
                className="group-hover:bg-accent transition-all duration-200 hover:ring-2 hover:ring-accent-color hover:ring-offset-2"
            >
                <p className="w-6 h-5 font-bold" translate="no" lang="zh-Hans">
                    灯
                </p>
            </Button>
        </Card>
    );
}
