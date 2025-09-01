import { registerOTel } from "@vercel/otel";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
    AlwaysOnSampler,
    TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
import type { IncomingMessage } from "http";

const name: string =
    process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1" ? "akari-preview" : "akari";

const ignoreIncomingRequestHook = (request: IncomingMessage): boolean => {
    return request.url?.includes("_next") ?? false;
};

export function register(): void {
    registerOTel({
        serviceName: name,
        instrumentations: [
            new HttpInstrumentation({
                ignoreIncomingRequestHook,
            }),
        ],
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
