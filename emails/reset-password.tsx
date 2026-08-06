import type { ReactElement } from "react";
import { Button, Heading, Hr, Link, Text } from "react-email";
import {
    AkariEmailLayout,
    BUTTON_STYLE,
} from "./components/akari-email-layout";
import {
    DESCRIPTION_STYLE,
    HINT_STYLE,
    SEPARATOR_STYLE,
    TITLE_STYLE,
} from "./styles";

// Synthetic preview URL: the local CLI renders without props, and runtime
// sends always pass the Better Auth-generated URL explicitly.
const PREVIEW_URL = "https://example.com/reset-password/preview-token";

/**
 * Better Auth password-reset email. Rendered by sendAuthEmail with the
 * recipient-specific URL; the default only exists for local previews.
 */
export default function ResetPasswordEmail({
    url = PREVIEW_URL,
}: {
    url?: string;
}): ReactElement {
    return (
        <AkariEmailLayout preview="Reset your Akari password">
            <Heading className="akari-heading" style={TITLE_STYLE}>
                Reset your password
            </Heading>
            <Text className="akari-muted" style={DESCRIPTION_STYLE}>
                We received a request to reset the password for your Akari
                account. Use the button below to choose a new one.
            </Text>
            <Button
                className="akari-button"
                href={url}
                style={{ ...BUTTON_STYLE, margin: "24px 0 0" }}
            >
                Reset password
            </Button>
            <Text className="akari-muted" style={HINT_STYLE}>
                Or copy and paste this URL into your browser:
            </Text>
            <Link href={url} className="akari-heading" style={HINT_STYLE}>
                {url}
            </Link>
            <Hr style={SEPARATOR_STYLE} />
            <Text className="akari-muted" style={HINT_STYLE}>
                This link expires in 60 minutes.
            </Text>
            <Text className="akari-muted" style={HINT_STYLE}>
                If you didn&apos;t request a password reset, you can safely
                ignore this email.
            </Text>
        </AkariEmailLayout>
    );
}
