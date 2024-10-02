import { HeaderComponent } from "@/components/Header";
import BookmarksPage from "@/components/Bookmarks";
import { Suspense } from "react";
import FallbackPage from "@/components/FallbackPage";

export default function Bookmarks() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderComponent />
      <Suspense fallback={<FallbackPage />}>
        <BookmarksPage />
      </Suspense>
    </div>
  );
}
