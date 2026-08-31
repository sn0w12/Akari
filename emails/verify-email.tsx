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
const PREVIEW_URL = "https://example.com/verify/preview-token";

/**
 * Better Auth verification email. Rendered by sendAuthEmail with the
 * recipient-specific URL; the default only exists for local previews.
 */
export default function VerifyEmail({
    url = PREVIEW_URL,
}: {
    url?: string;
}): ReactElement {
    return (
        <AkariEmailLayout preview="Confirm your Akari account">
            <Heading className="akari-heading" style={TITLE_STYLE}>
                Verify your email address
            </Heading>
            <Text className="akari-heading" style={DESCRIPTION_STYLE}>
                Click the button below to verify your email address for your
                Akari account.
            </Text>
            <Button
                className="akari-button"
                href={url}
                style={{ ...BUTTON_STYLE, margin: "24px 0 0" }}
            >
                Verify email address
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
                If you didn&apos;t sign up for Akari, you can safely ignore this
                email.
            </Text>
        </AkariEmailLayout>
    );
}
