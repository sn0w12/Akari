"use client";

import { useState, useEffect } from "react";
import { HeaderComponent } from "@/components/Header";
import ChapterReader from "@/components/MangaReader";

export default function MangaReaderPage() {
    const [isHeaderVisible, setHeaderVisible] = useState(false);
    const [isHoveringHeader, setHoveringHeader] = useState(false);
    const [isFooterVisible, setFooterVisible] = useState(false);
    const [isHoveringFooter, setHoveringFooter] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientY < 175) {
                setHeaderVisible(true);
            } else if (!isHoveringHeader) {
                setHeaderVisible(false);
            }

            if (e.clientY > window.innerHeight - 175) {
                setFooterVisible(true);
            } else if (!isHoveringFooter) {
                setFooterVisible(false);
            }
        };

        const handleHeaderMouseEnter = () => {
            setHoveringHeader(true);
            setHeaderVisible(true);
        };

        const handleHeaderMouseLeave = () => {
            setHoveringHeader(false);
            setHeaderVisible(false);
        };

        const handleFooterMouseEnter = () => {
            setHoveringFooter(true);
            setFooterVisible(true);
        };

        const handleFooterMouseLeave = () => {
            setHoveringFooter(false);
            setFooterVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

        const headerElement = document.querySelector(".header");
        if (headerElement) {
            headerElement.addEventListener(
                "mouseenter",
                handleHeaderMouseEnter,
            );
            headerElement.addEventListener(
                "mouseleave",
                handleHeaderMouseLeave,
            );
        }

        const footerElement = document.querySelector(".footer");
        if (footerElement) {
            footerElement.addEventListener(
                "mouseenter",
                handleFooterMouseEnter,
            );
            footerElement.addEventListener(
                "mouseleave",
                handleFooterMouseLeave,
            );
        }

        const checkForPopupElement = () => {
            const popupElement = document.querySelector(".manga-title");
            if (popupElement) {
                popupElement.addEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                popupElement.addEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            } else {
                setTimeout(checkForPopupElement, 100);
            }
        };

        checkForPopupElement();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (headerElement) {
                headerElement.removeEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                headerElement.removeEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            }
            if (footerElement) {
                footerElement.removeEventListener(
                    "mouseenter",
                    handleFooterMouseEnter,
                );
                footerElement.removeEventListener(
                    "mouseleave",
                    handleFooterMouseLeave,
                );
            }
            const popupElement = document.querySelector(".manga-title");
            if (popupElement) {
                popupElement.removeEventListener(
                    "mouseenter",
                    handleHeaderMouseEnter,
                );
                popupElement.removeEventListener(
                    "mouseleave",
                    handleHeaderMouseLeave,
                );
            }
        };
    }, [isHoveringHeader, isHoveringFooter]);

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <div
                className={`header ${isHeaderVisible ? "header-visible" : ""}`}
            >
                <HeaderComponent />
            </div>
            <ChapterReader isFooterVisible={isFooterVisible} />
        </div>
    );
}
