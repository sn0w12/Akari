import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { Providers } from "./auth/oauth";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogin = async (values: Record<string, unknown>) => {
    const email = values.email as string;
    const password = values.password as string;
    const supabase = createClient();
    startTransition(async () => {
      setError(null);

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        void queryClient.invalidateQueries({ queryKey: ["user"] });
        void router.navigate({ to: "/account" });
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onFormSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <Field name="email">
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="m@example.com" required />
                <FieldError />
              </Field>
              <Field name="password">
                <div className="flex items-center w-full justify-between">
                  <FieldLabel>Password</FieldLabel>
                  <Link
                    to="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input type="password" required />
                <FieldError />
              </Field>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in..." : "Login"}
              </Button>
              <Providers />
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
