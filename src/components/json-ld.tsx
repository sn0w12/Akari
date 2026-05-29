interface JsonLdProps {
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <>
            {/* react-doctor-disable-next-line react/no-danger */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
                }}
            />
        </>
    );
}
