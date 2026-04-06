import { CustomViewTransition } from "./view-transition";

export function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <CustomViewTransition
            enter={{
                default: "none",
                "transition-backwards": "animate-slide-from-left",
                "transition-forwards": "animate-slide-from-right",
            }}
            exit={{
                default: "none",
                "transition-backwards": "animate-slide-to-right",
                "transition-forwards": "animate-slide-to-left",
            }}
        >
            {children}
        </CustomViewTransition>
    );
}
