import type { ReactElement, ReactNode } from "react";
import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from "react-email";

const FONT_STACK =
    'Geist Variable, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// Mirrors the site's auth-card anatomy (src/components/ui/card.tsx,
// src/components/ui/button.tsx, src/routes/_default/auth/login) and the
// neutral palette in src/globals.css. Light values are inline for clients
// without <style> support; dark overrides kick in when the client honors
// prefers-color-scheme.
const BRAND = {
    light: {
        page: "#fafafa",
        card: "#ffffff",
        foreground: "#262626", // neutral-800, --foreground / --primary
        buttonText: "#fafafa", // neutral-50, --primary-foreground
        border: "#ebebeb", // black/8%
        muted: "#6e6e6e",
        buttonBorder: "#262626",
    },
    dark: {
        page: "#0f0f0f",
        card: "#191919",
        foreground: "#f5f5f5", // neutral-100, --primary
        buttonText: "#262626", // neutral-800, --primary-foreground
        border: "#292929", // white/6%
        muted: "#808080",
        buttonBorder: "#f5f5f5",
    },
} as const;

const DARK_MODE_CSS = `
    @media (prefers-color-scheme: dark) {
        .akari-html, .akari-body { background-color: ${BRAND.dark.page} !important; }
        .akari-card { background-color: ${BRAND.dark.card} !important; border-color: ${BRAND.dark.border} !important; }
        .akari-heading, .akari-text { color: ${BRAND.dark.foreground} !important; }
        .akari-muted { color: ${BRAND.dark.muted} !important; }
        .akari-button { background-color: ${BRAND.dark.foreground} !important; color: ${BRAND.dark.buttonText} !important; border-color: ${BRAND.dark.buttonBorder} !important; }
    }
    .akari-button span { line-height: 20px !important; }
    @media (max-width: 480px) {
        .akari-button { font-size: 16px !important; line-height: 24px !important; padding-top: 5px !important; padding-bottom: 5px !important; }
        .akari-button span { line-height: 24px !important; }
    }
`;

// Site card: rounded-2xl, border, shadow-xs/5 + top edge highlight. Site
// default button: rounded-lg, primary bg, inset top highlight, small shadow.
const CARD_STYLE = {
    backgroundColor: BRAND.light.card,
    borderRadius: 16,
    border: `1px solid ${BRAND.light.border}`,
    boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.05)",
} as const;

const BUTTON_STYLE = {
    display: "block",
    width: "auto",
    backgroundColor: BRAND.light.foreground,
    color: BRAND.light.buttonText,
    border: `1px solid ${BRAND.light.buttonBorder}`,
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    textAlign: "center" as const,
    boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 2px 0 rgba(38,38,38,0.24)",
} as const;

/**
 * Shared Akari surface for transactional emails. Content-only templates
 * render inside the card; this layout owns the card frame, the responsive
 * full-width button contract, and the site-style footer. No default export
 * so the React Email CLI does not list it as a preview entrypoint.
 */
export function AkariEmailLayout({
    preview,
    children,
}: {
    preview: string;
    children: ReactNode;
}): ReactElement {
    return (
        <Html
            lang="en"
            className="akari-html"
            style={{ backgroundColor: BRAND.light.page }}
        >
            <Head>
                <style>{DARK_MODE_CSS}</style>
            </Head>
            <Preview>{preview}</Preview>
            <Body
                className="akari-body"
                style={{
                    width: "100%",
                    margin: 0,
                    padding: "32px 16px",
                    fontFamily: FONT_STACK,
                }}
            >
                <Container style={{ maxWidth: 600 }}>
                    <Section
                        className="akari-card"
                        style={{
                            ...CARD_STYLE,
                            padding: "24px 24px",
                        }}
                    >
                        <Img
                            src="https://raw.githubusercontent.com/sn0w12/Akari/refs/heads/master/public/img/icon.png"
                            width="48"
                            height="48"
                            style={{ margin: "0 auto 16px", display: "block" }}
                        />
                        {children}
                    </Section>
                    <Text
                        className="akari-muted"
                        style={{
                            fontSize: 12,
                            lineHeight: "18px",
                            color: BRAND.light.muted,
                            textAlign: "center",
                            margin: "16px 0 0",
                        }}
                    >
                        © {new Date().getFullYear()} Akari
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

export { BUTTON_STYLE };
