"use client";

import React from "react";
import PuffLoader from "react-spinners/PuffLoader";

interface SpinnerProps {
    size?: number;
}

const getForegroundColor = (): string => {
    if (typeof window === "undefined") return "#000000";
    const rootStyles = getComputedStyle(document.documentElement);
    const foregroundColor = rootStyles.getPropertyValue("--foreground").trim();
    return foregroundColor || "#000000";
};

const Spinner: React.FC<SpinnerProps> = ({ size = 60 }) => {
    const spinnerColor = getForegroundColor();
    return <PuffLoader color={spinnerColor} size={size} />;
};

export default Spinner;
