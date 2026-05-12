import { CustomViewTransition } from "./view-transition";

export function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <CustomViewTransition>
            {children}
        </CustomViewTransition>
    );
}
