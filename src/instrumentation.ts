import { registerOTel } from "@vercel/otel";
import {
    AlwaysOnSampler,
    TraceIdRatioBasedSampler,
    type Sampler,
    SamplingDecision,
    type SamplingResult,
} from "@opentelemetry/sdk-trace-node";
import { Attributes, Context, Link, SpanKind } from "@opentelemetry/api";

const name =
    process.env.NEXT_PUBLIC_AKARI_PREVIEW === "1" ? "akari-preview" : "akari";

class IgnoreNextSampler implements Sampler {
    private readonly originalSampler: Sampler;

    constructor(originalSampler: Sampler) {
        this.originalSampler = originalSampler;
    }

    shouldSample(
        context: Context,
        traceId: string,
        spanName: string,
        spanKind: SpanKind,
        attributes: Attributes,
        links: Link[],
    ): SamplingResult {
        if (spanName.includes("_next")) {
            return {
                decision: SamplingDecision.NOT_RECORD,
            };
        }
        return this.originalSampler.shouldSample(
            context,
            traceId,
            spanName,
            spanKind,
            attributes,
            links,
        );
    }
}

const baseSampler: Sampler =
    process.env.NODE_ENV === "development"
        ? new AlwaysOnSampler()
        : new TraceIdRatioBasedSampler(0.1);

const customSampler: Sampler = new IgnoreNextSampler(baseSampler);

export function register() {
    registerOTel({
        serviceName: name,
        instrumentationConfig: {
            fetch: {
                ignoreUrls: [/_next/],
            },
        },
        traceSampler: customSampler,
    });
}
