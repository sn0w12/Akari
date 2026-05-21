import type { FC } from "react";

interface SpinnerProps {
    size?: number;
}

const Spinner: FC<SpinnerProps> = ({ size = 60 }) => (
    <span
        className="animate-spin rounded-full border-[3px] border-foreground border-t-transparent inline-block"
        style={{ width: size, height: size }}
    />
);

export default Spinner;
