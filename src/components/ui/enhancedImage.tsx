"use client";

import React, { useState, useRef, CSSProperties, type JSX } from "react";
import Image, { ImageProps } from "next/image";
import { getSetting } from "@/lib/settings";

type HoverEffect =
    | "none"
    | "zoom"
    | "rotate"
    | "tilt"
    | "morph"
    | "glitch"
    | "reveal"
    | "shutter"
    | "outline"
    | "neon"
    | "dynamic-tilt";

interface EnhancedImageProps extends Omit<ImageProps, "className"> {
    hoverEffect: HoverEffect;
    className?: string;
}

interface EffectConfig {
    containerClass: string;
    imageClass: string;
    dynamicStyles?: (
        isHovered: boolean,
        event: React.MouseEvent<HTMLDivElement> | null,
        containerRef: React.RefObject<HTMLDivElement | null>,
    ) => CSSProperties;
}

const effectConfigs: Record<HoverEffect, EffectConfig> = {
    none: { containerClass: "", imageClass: "" },
    zoom: {
        containerClass: "",
        imageClass: "transition-transform duration-300 hover:scale-110",
    },
    rotate: {
        containerClass: "",
        imageClass: "transition-transform duration-300 hover:rotate-6",
    },
    tilt: {
        containerClass: "",
        imageClass:
            "transition-transform duration-300 hover:[transform:perspective(1000px)_rotateX(10deg)_rotateY(10deg)]",
    },
    morph: {
        containerClass: "",
        imageClass:
            "transition-[clip-path] duration-300 hover:[clip-path:polygon(0%_0%,75%_0%,100%_50%,75%_100%,0%_100%)]",
    },
    glitch: {
        containerClass: "",
        imageClass: "hover:[animation:glitch_0.5s_infinite]",
        dynamicStyles: (isHovered) => ({
            animation: isHovered ? "glitch 0.5s infinite" : "none",
        }),
    },
    reveal: {
        containerClass: "",
        imageClass:
            "transition-[mask-position] duration-300 hover:[mask-image:linear-gradient(to_right,#000_50%,transparent_50%)] hover:[mask-size:200%_100%] hover:[mask-position:100%]",
    },
    shutter: {
        containerClass: "relative overflow-hidden",
        imageClass: "",
        dynamicStyles: (isHovered) => ({
            position: "relative",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isHovered
                    ? "repeating-linear-gradient(to right,transparent,transparent 2px,currentColor 2px,currentColor 4px)"
                    : "none",
                opacity: 0.5,
                transition: "opacity 0.3s",
            },
        }),
    },
    outline: {
        containerClass: "",
        imageClass: "transition-all duration-300",
        dynamicStyles: (isHovered) => ({
            outline: isHovered ? "4px solid currentColor" : "none",
            outlineOffset: isHovered ? "4px" : "0",
        }),
    },
    neon: {
        containerClass: "",
        imageClass: "transition-all duration-300",
        dynamicStyles: (isHovered) => ({
            boxShadow: isHovered
                ? "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #0ff, 0 0 35px #0ff, 0 0 40px #0ff, 0 0 50px #0ff, 0 0 75px #0ff"
                : "none",
        }),
    },
    "dynamic-tilt": {
        containerClass:
            "transition-transform duration-300 ease-out transform-gpu",
        imageClass: "",
        dynamicStyles: (isHovered, event, containerRef) => {
            if (!isHovered || !event || !containerRef.current) return {};
            const { left, top, width, height } =
                containerRef.current.getBoundingClientRect();
            const x = (event.clientX - left) / width;
            const y = (event.clientY - top) / height;
            const tiltX = (y - 0.5) * -20;
            const tiltY = (x - 0.5) * 20;
            return {
                transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`,
                transition: "transform 0.1s ease",
            };
        },
    },
};

/**
 * EnhancedImage component that provides various hover effects on images.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {string} props.hoverEffect - The type of hover effect to apply.
 * @param {string} props.alt - The alt text for the image.
 * @param {string} [props.className=""] - Additional class names for the image.
 * @param {Object} props.props - Additional properties to pass to the image component.
 * @returns {JSX.Element} The rendered EnhancedImage component.
 *
 * @example
 * <EnhancedImage
 *   hoverEffect="glitch"
 *   alt="Sample Image"
 *   src="/path/to/image.jpg"
 * />
 */
export default function EnhancedImage({
    hoverEffect,
    alt,
    className = "",
    ...props
}: EnhancedImageProps): JSX.Element {
    const [isHovered, setIsHovered] = useState(false);
    const [mouseEvent, setMouseEvent] =
        useState<React.MouseEvent<HTMLDivElement> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { containerClass, imageClass, dynamicStyles } =
        effectConfigs[hoverEffect];

    const fancyAnimationsEnabled = getSetting("fancyAnimations");

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setMouseEvent(null);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
        setMouseEvent(e);

    const containerStyle =
        dynamicStyles && fancyAnimationsEnabled
            ? dynamicStyles(isHovered, mouseEvent, containerRef)
            : {};

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${containerClass}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={containerStyle}
        >
            <Image
                className={`${fancyAnimationsEnabled ? "transition-all duration-300 ease-in-out" : ""} ${imageClass} ${className}`}
                alt={alt}
                {...props}
            />
            {hoverEffect === "glitch" && fancyAnimationsEnabled && (
                <style jsx global>{`
                    @keyframes glitch {
                        0% {
                            transform: translate(0);
                        }
                        20% {
                            transform: translate(-5px, 5px);
                        }
                        40% {
                            transform: translate(-5px, -5px);
                        }
                        60% {
                            transform: translate(5px, 5px);
                        }
                        80% {
                            transform: translate(5px, -5px);
                        }
                        100% {
                            transform: translate(0);
                        }
                    }
                `}</style>
            )}
        </div>
    );
}
