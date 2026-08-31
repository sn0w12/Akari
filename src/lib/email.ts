import { render, toPlainText } from "@react-email/render";
import { env } from "@/lib/env";
import { createElement } from "react";
import { Resend } from "resend";
import ResetPasswordEmail from "../../emails/reset-password";
import VerifyEmail from "../../emails/verify-email";

const subjects = {
    verification: "Verify your Akari email address",
    "password-reset": "Reset your Akari password",
} as const;

/**
 * Server-only transactional email sender for Better Auth hooks.
 * Fires the Resend request without blocking the caller; logs failures.
 * Never import this module from client code.
 */
export function sendAuthEmail(input: {
    kind: "verification" | "password-reset";
    to: string;
    url: string;
}): void {
    const apiKey = env("RESEND_API_KEY");
    const from = env("RESEND_FROM_EMAIL");

    if (!apiKey || !from) {
        console.error(
            "[email] Cannot send " +
                input.kind +
                " email: RESEND_API_KEY and RESEND_FROM_EMAIL must be set. " +
                "Use an address on a Resend-verified domain; onboarding@resend.dev is test-only.",
        );
        return;
    }

    const subject = subjects[input.kind];

    void (async () => {
        try {
            const element =
                input.kind === "verification"
                    ? createElement(VerifyEmail, { url: input.url })
                    : createElement(ResetPasswordEmail, { url: input.url });
            const html = await render(element);
            const text = toPlainText(html, {
                selectors: [
                    {
                        selector: "h1",
                        format: "heading",
                        options: { uppercase: false },
                    },
                ],
            });
            const { error } = await new Resend(apiKey).emails.send({
                from,
                to: input.to,
                subject,
                html,
                text,
            });
            if (error) {
                console.error(
                    `[email] Resend failed to send ${input.kind} email to ${input.to}: ${error.message}`,
                );
            }
        } catch (error: unknown) {
            console.error(
                `[email] Error sending ${input.kind} email to ${input.to}: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    })();
}
