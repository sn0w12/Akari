"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageReader from "./manga-reader/readers/page-reader";
import StripReader from "./manga-reader/readers/strip-reader";
import { FooterProvider } from "@/contexts/footer-context";
import { BreadcrumbSetter } from "./breadcrumb-setter";

interface ReaderProps {
    chapter: components["schemas"]["ChapterResponse"];
}

export function Reader({ chapter }: ReaderProps) {
    const [isStripMode, setIsStripMode] = useState<boolean | undefined>(
        undefined
    );
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    const [bookmarkState, setBookmarkState] = useState<boolean | null>(null);
    const [bgColor, setBgColor] = useState<string>("bg-background");

    useEffect(() => {
        switch (bookmarkState) {
            case true:
                setBgColor("bg-accent-positive/40");
                break;
            case false:
                setBgColor("bg-destructive");
                break;
            default:
                setBgColor("bg-background");
        }
    }, [bookmarkState]);

    const localstorageId = useMemo(
        () => `readerMode-${chapter.mangaId}`,
        [chapter.mangaId]
    );

    async function setReaderMode(isStrip: boolean) {
        setIsStripMode(isStrip);
        localStorage.setItem(localstorageId, isStrip ? "strip" : "page");
    }

    function toggleReaderMode(override: boolean = true) {
        if (isStripMode !== undefined) {
            setReaderMode(!isStripMode);
        } else {
            setReaderMode(override);
        }
    }

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        setIsInactive(false);
        inactivityTimer.current = setTimeout(() => {
            setIsInactive(true);
        }, 2000);
    }, []);

    useEffect(() => {
        // Initialize the inactivity timer
        resetInactivityTimer();

        const events = ["mousemove", "scroll", "touchstart"];
        events.forEach((event) => {
            window.addEventListener(event, resetInactivityTimer);
        });

        return () => {
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [resetInactivityTimer]);

    return (
        <FooterProvider stripMode={isStripMode}>
            <BreadcrumbSetter
                orig={chapter.mangaId}
                title={chapter.mangaTitle}
            />
            <div>
                {isStripMode ? (
                    <StripReader
                        chapter={chapter}
                        toggleReaderMode={toggleReaderMode}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                ) : (
                    <PageReader
                        chapter={chapter}
                        toggleReaderMode={toggleReaderMode}
                        isInactive={isInactive}
                        bgColor={bgColor}
                        setBookmarkState={setBookmarkState}
                    />
                )}
            </div>
        </FooterProvider>
    );
}
