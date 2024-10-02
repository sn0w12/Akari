import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Icon() {
  return (
    <Card>
      <Button variant="ghost" size="icon" className="group-hover:bg-accent">
        <p className="w-6 h-5 font-bold">灯</p>
      </Button>
    </Card>
  );
}
