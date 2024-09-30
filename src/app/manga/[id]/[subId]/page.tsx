"use client";

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
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 175) {
        setHeaderVisible(true);
      } else if (!isHoveringHeader) {
        setHeaderVisible(false);
      }
    };

    const handleMouseEnter = () => {
      setHoveringHeader(true);
      setHeaderVisible(true);
    };

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

    // Retry function to find the popup element
    const checkForPopupElement = () => {
      const popupElement = document.querySelector(".manga-title");
      if (popupElement) {
        popupElement.addEventListener("mouseenter", handleMouseEnter);
        popupElement.addEventListener("mouseleave", handleMouseLeave);
      } else {
        // Retry after 100ms if popup element is not found
        setTimeout(checkForPopupElement, 100);
      }
    };

    // Start checking for popup element
    checkForPopupElement();

    // Clean up event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (headerElement) {
        headerElement.removeEventListener("mouseenter", handleMouseEnter);
        headerElement.removeEventListener("mouseleave", handleMouseLeave);
      }
      const popupElement = document.querySelector(".manga-title");
      if (popupElement) {
        popupElement.removeEventListener("mouseenter", handleMouseEnter);
        popupElement.removeEventListener("mouseleave", handleMouseLeave);
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
