import { AxiosError } from "axios";
import { ApiErrorData } from ".";

/**
 * Extracts error data from an Axios error.
 * @param error - The Axios error instance
 * @returns An ApiErrorData object with message and optional details
 */
export function extractErrorFromAxios(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: AxiosError<any, any>
): ApiErrorData {
    if (error.response) {
        return {
            message: error.response.data?.message || error.message,
            details: error.response.data,
        };
    } else if (error.request) {
        return {
            message: "No response received from server",
            details: error.request,
        };
    } else {
        return {
            message: error.message || "An unknown error occurred",
            details: error,
        };
    }
}
