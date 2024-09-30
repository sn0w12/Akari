import { HeaderComponent } from "@/components/Header";
import GenrePage from "@/components/Genre";

interface PageProps {
  params: { id: string };
}

export default function Home({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderComponent />
      <GenrePage
        params={{
          id: params.id,
        }}
      />
    </div>
  );
}
