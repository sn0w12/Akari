import { registerOTel } from "@vercel/otel";
import {
    AlwaysOnSampler,
    TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";

const name =
    process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1" ? "akari-preview" : "akari";

export function register() {
    registerOTel({
        serviceName: name,
        instrumentationConfig: {
            fetch: {
                ignoreUrls: [/_next/],
            },
        },
        traceSampler:
            process.env.NODE_ENV === "development"
                ? new AlwaysOnSampler()
                : new TraceIdRatioBasedSampler(0.1),
    });
}
