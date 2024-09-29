"use client";

import { useState, useEffect } from "react";
import { HeaderComponent } from "@/components/Header";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    // Check if window and localStorage are available
    if (typeof window !== "undefined") {
      const user_data = localStorage.getItem("accountInfo");
      if (user_data) {
        const eventSource = new EventSource(
          `/api/bookmarks/all?user_data=${encodeURIComponent(user_data)}`
        );

        eventSource.onmessage = (event) => {
          const bookmark = JSON.parse(event.data);
          console.log("Received bookmark:", bookmark);
          setBookmarks((prevBookmarks) => {
            const updatedBookmarks = [...prevBookmarks, bookmark];
            return updatedBookmarks;
          });
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          eventSource.close();
        };

        // Cleanup when component unmounts
        return () => {
          eventSource.close();
        };
      } else {
        console.error("No user_data found in localStorage.");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderComponent />
      {/* Render bookmarks */}
      <ul>
        {bookmarks.map((bookmark, index) => (
          <li key={index}>{bookmark.note_story_name}</li>
        ))}
      </ul>
    </div>
  );
}
