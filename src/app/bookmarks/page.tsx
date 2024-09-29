import { HeaderComponent } from "@/components/Header";
import BookmarksPage from "@/components/Bookmarks";

export default function Bookmarks() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderComponent />
      <BookmarksPage />
    </div>
  );
}
