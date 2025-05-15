import React, { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";

interface SpinnerProps {
    size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 60 }) => {
    const [spinnerColor, setSpinnerColor] = useState<string>("");

    useEffect(() => {
        // Fetch the CSS variable from the root element
        const rootStyles = getComputedStyle(document.documentElement);

        // Get the foreground color and construct the HSL string
        const foregroundColor = rootStyles
            .getPropertyValue("--foreground")
            .trim();

        // Only set spinnerColor if the CSS variable is defined
        if (foregroundColor) {
            setSpinnerColor(`hsl(${foregroundColor})`); // Construct the hsl() color string
        } else {
            setSpinnerColor("#000000"); // Fallback to black if the variable is not defined
        }
    }, []);

    return <PuffLoader aria-label="Loading" color={spinnerColor} size={size} />;
};

export default Spinner;
