import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment, inPreview } from "@/config";
import pkg from "../../../package.json";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5188/";
const baseUrl = inDevelopment ? "http://localhost:5188/" : apiUrl;
export const client = createClient<paths>({ baseUrl, credentials: "include" });

export const serverHeaders = {
    "X-API-Key": process.env.API_KEY || "",
    "user-agent": `AkariWebsite/${pkg.version}/${
        inPreview ? "preview" : "production"
    }`,
};
