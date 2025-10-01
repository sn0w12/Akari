"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

interface FooterContextType {
    isFooterVisible: boolean;
    setFooterVisible: (visible: boolean) => void;
    isTouchInteractionEnabled: boolean;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

interface FooterProviderProps {
    children: ReactNode;
    stripMode?: boolean;
}

export function FooterProvider({
    children,
    stripMode = false,
}: FooterProviderProps) {
    const [isFooterVisible, setFooterVisible] = useState(false);
    const [isHoveringFooter, setHoveringFooter] = useState(false);
    const [isTouchInteractionEnabled, setTouchInteractionEnabled] =
        useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isFooterVisible) {
            // Delay enabling touch interactions to prevent accidental clicks
            timer = setTimeout(() => {
                setTouchInteractionEnabled(true);
            }, 100);
        } else {
            setTouchInteractionEnabled(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isFooterVisible]);

    useEffect(() => {
        const isSidebarPresent = () =>
            document.getElementById("sidebar") !== null;
        const isChapterSelectorPresent = () =>
            document.getElementById("chapter-selector") !== null;

        const handleMouseMove = (e: MouseEvent) => {
            const sidebarVisible = isSidebarPresent();
            const chapterSelectorVisible = isChapterSelectorPresent();

            if (
                (e.clientY > window.innerHeight - 175 && !sidebarVisible) ||
                chapterSelectorVisible
            ) {
                setFooterVisible(true);
            } else if (!isHoveringFooter) {
                setFooterVisible(false);
            }
        };

        const handleFooterMouseEnter = () => {
            setHoveringFooter(true);
        };

        const handleFooterMouseLeave = () => {
            setHoveringFooter(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

        const footerElement = document.querySelector(".footer");
        if (footerElement) {
            footerElement.addEventListener(
                "mouseenter",
                handleFooterMouseEnter
            );
            footerElement.addEventListener(
                "mouseleave",
                handleFooterMouseLeave
            );
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (footerElement) {
                footerElement.removeEventListener(
                    "mouseenter",
                    handleFooterMouseEnter
                );
                footerElement.removeEventListener(
                    "mouseleave",
                    handleFooterMouseLeave
                );
            }
        };
    }, [isHoveringFooter, stripMode]);

    return (
        <FooterContext.Provider
            value={{
                isFooterVisible,
                setFooterVisible,
                isTouchInteractionEnabled,
            }}
        >
            {children}
        </FooterContext.Provider>
    );
}

export function useFooterVisibility(): FooterContextType {
    const context = useContext(FooterContext);

    if (context === undefined) {
        throw new Error(
            "useFooterVisibility must be used within a FooterProvider"
        );
    }

    return context;
}
