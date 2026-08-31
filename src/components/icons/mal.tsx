import { LucideProps } from "lucide-react";

export function MalIcon({ size, ...props }: LucideProps) {
    return (
        <svg
            viewBox="0 0 256 256"
            preserveAspectRatio="xMidYMid meet"
            style={{
                display: "inline-block",
                width: size ?? "100%",
                height: size ?? "100%",
            }}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect width="256" height="256" fill="var(--card)" />
            <path
                fill="var(--foreground)"
                d="m 30.638616,88.40918 v 68.70703 h 17.759766 v -41.91016 l 15.470703,19.77344 16.67825,-19.77344 v 41.91016 H 98.307101 V 88.40918 H 80.547335 L 63.869085,109.82324 48.398382,88.40918 Z"
            />
            <path
                fill="var(--foreground)"
                d="m 182.49799,88.40918 v 68.70703 h 39.07974 l 3.78365,-14.65739 H 200.25775 V 88.40918 Z"
            />
            <path
                fill="var(--foreground)"
                d="m 149.65186,88.40918 c -21.64279,0 -35.06651,10.210974 -39.36914,25.39258 -4.19953,14.81779 0.34128,34.3715 10.28711,53.78906 l 14.85742,-10.47461 c 0,0 -7.06411,-9.21728 -8.39453,-23.03516 h 21.98437 v 23.03516 h 19.73438 v -51.67969 h -19.73438 v 14.9668 H 130.8003 c 1.71696,-11.1972 8.295,-17.30859 15.46875,-17.30859 h 25.8164 l -5.12304,-14.68555 z"
            />
        </svg>
    );
}
