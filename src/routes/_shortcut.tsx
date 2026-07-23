import { ThemeProvider } from "@/components/theme-provider";
import { ErrorProvider } from "@/contexts/error-context";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_shortcut")({
    component: ShortcutLayout,
});

function ShortcutLayout() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <ErrorProvider>
                <Outlet />
            </ErrorProvider>
        </ThemeProvider>
    );
}
