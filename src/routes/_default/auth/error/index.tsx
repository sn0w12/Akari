import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_default/auth/error/")({
    component: AuthErrorPage,
    validateSearch: (search: Record<string, string>) => ({
        error: search.error || "",
    }),
});

function AuthErrorPage() {
    const { error } = Route.useSearch();
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error ? (
                                <p className="text-sm text-muted-foreground">Code error: {error}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
