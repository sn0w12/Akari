import { performanceMetrics } from "@/lib/api/performance";
import {
    createApiResponse,
    createApiErrorResponse,
    isApiErrorData,
    CreateApiResponseOptions,
} from "@/lib/api";
import axios from "axios";
import { extractErrorFromAxios } from "@/lib/api/axios";

export type FetchFunction<T, Args extends unknown[]> = (
    ...args: Args
) => Promise<T>;

export function createApiHandler<T, Args extends unknown[]>(
    fetchFn: FetchFunction<T, Args>,
    options: CreateApiResponseOptions,
    argsExtractor: (req: Request, params: unknown) => Args
) {
    return async function GET(
        req: Request,
        props: { params: Promise<unknown> }
    ): Promise<Response> {
        const params = await props.params;
        const args = argsExtractor(req, params);

        try {
            const data = await fetchFn(...args);

            if (isApiErrorData(data)) {
                return createApiErrorResponse(data);
            }

            return createApiResponse(data, {
                ...options,
                performance: performanceMetrics,
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorData = extractErrorFromAxios(error);
                return createApiErrorResponse(errorData, {
                    status: error.response?.status || 500,
                });
            }
            return createApiErrorResponse({
                message:
                    (error as Error).message || "An unknown error occurred",
            });
        }
    };
}
