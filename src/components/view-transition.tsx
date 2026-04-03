import { ViewTransition, ViewTransitionProps } from "react";

interface CustomViewTransitionProps extends ViewTransitionProps {
    children: React.ReactNode;
}

export function CustomViewTransition({
    children,
    ...props
}: CustomViewTransitionProps) {
    return <ViewTransition {...props}>{children}</ViewTransition>;
}
