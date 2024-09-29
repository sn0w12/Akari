"use client"; // Add this line to specify that this is a Client Component

import { useState, useEffect } from "react";
import { HeaderComponent } from "@/components/Header";
import ChapterReader from "@/components/MangaReader";

interface PageProps {
  params: { id: string; subId: string };
}

export default function MangaReaderPage({ params }: PageProps) {
  const [isHeaderVisible, setHeaderVisible] = useState(false);
  const [isHoveringHeader, setHoveringHeader] = useState(false); // Track hovering over header

  useEffect(() => {
    // Mouse movement near the top (for showing the header)
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 150) {
        setHeaderVisible(true);
      } else if (!isHoveringHeader) {
        setHeaderVisible(false);
      }
    };

    // Handle mouse entering the header (keep it visible)
    const handleMouseEnter = () => {
      setHoveringHeader(true);
      setHeaderVisible(true);
    };

    // Handle mouse leaving the header (allow it to disappear)
    const handleMouseLeave = () => {
      setHoveringHeader(false);
      setHeaderVisible(false);
    };

    // Attach mousemove event listener for top area
    window.addEventListener("mousemove", handleMouseMove);

    // Find header element to attach mouse enter/leave events
    const headerElement = document.querySelector(".header");
    if (headerElement) {
      headerElement.addEventListener("mouseenter", handleMouseEnter);
      headerElement.addEventListener("mouseleave", handleMouseLeave);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (headerElement) {
        headerElement.removeEventListener("mouseenter", handleMouseEnter);
        headerElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isHoveringHeader]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`header ${isHeaderVisible ? "header-visible" : ""}`}>
        <HeaderComponent />
      </div>
      <ChapterReader isHeaderVisible={isHeaderVisible} />
    </div>
  );
}
