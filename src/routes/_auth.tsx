import { ThemeProvider } from "@/components/theme-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
    component: AuthLayout,
});

function AuthLayout() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div id="scroll-element" className="flex-grow overflow-x-hidden">
                <Outlet />
            </div>
        </ThemeProvider>
    );
}
