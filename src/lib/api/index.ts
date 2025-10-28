import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment } from "@/config";

const baseUrl = inDevelopment
    ? "http://localhost:5188/"
    : "http://localhost:5188/";
export const client = createClient<paths>({ baseUrl, credentials: "include" });

export const serverHeaders = {
    "X-API-Key": process.env.API_KEY || "",
};
