/**
 * A duration expressed in days, hours, minutes, and/or seconds.
 * All fields are optional; missing or zero fields are ignored.
 */
export interface Duration {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

/**
 * Converts a Duration object to total seconds.
 * @example toSeconds({ days: 1, hours: 2, minutes: 30, seconds: 15 }) // 95415
 */
export function toSeconds(duration: Duration): number {
    const daysSec = (duration.days || 0) * 86400;
    const hoursSec = (duration.hours || 0) * 3600;
    const minutesSec = (duration.minutes || 0) * 60;
    const seconds = duration.seconds || 0;
    return daysSec + hoursSec + minutesSec + seconds;
}

export class ResponseCacheControlBuilder {
    private directives: {
        maxAge?: number;
        sMaxAge?: number;
        staleWhileRevalidate?: number;
        staleIfError?: number;
        noCache?: boolean;
        noStore?: boolean;
        noTransform?: boolean;
        mustRevalidate?: boolean;
        proxyRevalidate?: boolean;
        mustUnderstand?: boolean;
        private?: boolean;
        public?: boolean;
        immutable?: boolean;
    } = {};

    /**
     * Sets the `max-age` directive in seconds.
     *
     * @param duration - Cache lifetime to apply.
     * @returns The current builder instance.
     */
    maxAge(duration: Duration): this {
        this.directives.maxAge = toSeconds(duration);
        return this;
    }

    /**
     * Sets the `s-maxage` directive in seconds.
     *
     * @param duration - Shared-cache lifetime to apply.
     * @returns The current builder instance.
     */
    sMaxAge(duration: Duration): this {
        this.directives.sMaxAge = toSeconds(duration);
        return this;
    }

    /**
     * Sets the `stale-while-revalidate` directive in seconds.
     *
     * @param duration - Time a stale response may be served while revalidating.
     * @returns The current builder instance.
     */
    staleWhileRevalidate(duration: Duration): this {
        this.directives.staleWhileRevalidate = toSeconds(duration);
        return this;
    }

    /**
     * Sets the `stale-if-error` directive in seconds.
     *
     * @param duration - Time a stale response may be served after an error.
     * @returns The current builder instance.
     */
    staleIfError(duration: Duration): this {
        this.directives.staleIfError = toSeconds(duration);
        return this;
    }

    /**
     * Enables or disables the `no-cache` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    noCache(enable: boolean = true): this {
        this.directives.noCache = enable;
        return this;
    }

    /**
     * Enables or disables the `no-store` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    noStore(enable: boolean = true): this {
        this.directives.noStore = enable;
        return this;
    }

    /**
     * Enables or disables the `no-transform` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    noTransform(enable: boolean = true): this {
        this.directives.noTransform = enable;
        return this;
    }

    /**
     * Enables or disables the `must-revalidate` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    mustRevalidate(enable: boolean = true): this {
        this.directives.mustRevalidate = enable;
        return this;
    }

    /**
     * Enables or disables the `proxy-revalidate` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    proxyRevalidate(enable: boolean = true): this {
        this.directives.proxyRevalidate = enable;
        return this;
    }

    /**
     * Enables or disables the `must-understand` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    mustUnderstand(enable: boolean = true): this {
        this.directives.mustUnderstand = enable;
        return this;
    }

    /**
     * Enables or disables the `private` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    private(enable: boolean = true): this {
        this.directives.private = enable;
        return this;
    }

    /**
     * Enables or disables the `public` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    public(enable: boolean = true): this {
        this.directives.public = enable;
        return this;
    }

    /**
     * Enables or disables the `immutable` directive.
     *
     * @param enable - Whether to include the directive.
     * @returns The current builder instance.
     */
    immutable(enable: boolean = true): this {
        this.directives.immutable = enable;
        return this;
    }

    /**
     * Builds the `Cache-Control` header value using a deterministic directive order.
     *
     * @returns The serialized header value.
     */
    build(): string {
        const parts: string[] = [];

        if (this.directives.maxAge !== undefined)
            parts.push(`max-age=${this.directives.maxAge}`);
        if (this.directives.sMaxAge !== undefined)
            parts.push(`s-maxage=${this.directives.sMaxAge}`);
        if (this.directives.staleWhileRevalidate !== undefined)
            parts.push(
                `stale-while-revalidate=${this.directives.staleWhileRevalidate}`,
            );
        if (this.directives.staleIfError !== undefined)
            parts.push(`stale-if-error=${this.directives.staleIfError}`);

        if (this.directives.noCache) parts.push("no-cache");
        if (this.directives.noStore) parts.push("no-store");
        if (this.directives.noTransform) parts.push("no-transform");
        if (this.directives.mustRevalidate) parts.push("must-revalidate");
        if (this.directives.proxyRevalidate) parts.push("proxy-revalidate");
        if (this.directives.mustUnderstand) parts.push("must-understand");
        if (this.directives.private) parts.push("private");
        if (this.directives.public) parts.push("public");
        if (this.directives.immutable) parts.push("immutable");

        return parts.join(", ");
    }

    /**
     * Returns the serialized `Cache-Control` header value.
     *
     * @returns The same value produced by {@link build}.
     */
    toString(): string {
        return this.build();
    }
}
