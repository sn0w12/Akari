import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
import { useRouter } from "@tanstack/react-router";
import { useState, useTransition } from "react";

export function SetupAccountForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (values: Record<string, unknown>) => {
    const userName = values.username as string;
    const displayName = values.displayName as string;

    startTransition(async () => {
      try {
        const { error } = await client.PUT("/v2/user/profile", {
          body: {
            username: userName,
            displayName: displayName,
          },
        });

        if (error) {
          setError(error.data.message);
          return;
        }

        void router.navigate({ to: "/account" });
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Setup Account</CardTitle>
          <CardDescription>Complete your account setup</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onFormSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <Fieldset>
                <FieldsetLegend>Profile</FieldsetLegend>
                <div className="flex flex-col gap-4">
                  <Field name="username">
                    <FieldLabel>Username</FieldLabel>
                    <Input placeholder="username" required />
                    <FieldError />
                  </Field>
                  <Field name="displayName">
                    <FieldLabel>Display Name</FieldLabel>
                    <Input placeholder="Display Name" required />
                    <FieldError />
                  </Field>
                </div>
              </Fieldset>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Setting up..." : "Setup Account"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
