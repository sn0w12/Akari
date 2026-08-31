import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponseCacheControlBuilder } from "@/lib/cache";

export const Route = createFileRoute("/_default/auth/sign-up-success/")({
    validateSearch: (search: Record<string, string>): { error?: string } => ({
        error: search.error || undefined,
    }),
    component: SignUpSuccessPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder().noCache().build(),
    }),
});

function SignUpSuccessPage() {
    const { error } = Route.useSearch();
    return (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    {error ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Verification Failed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Your email verification link is invalid or
                                    expired. Please request a new verification
                                    email and try again.
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Code error: {error}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    Registration Successful
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Your account has been created. Please check
                                    your email to confirm your registration.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
