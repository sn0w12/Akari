import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { inDevelopment } from "@/config";

const baseUrl = inDevelopment
    ? "http://localhost:5188/"
    : "https://api.akarimanga.dpdns.org/";
export const client = createClient<paths>({ baseUrl, credentials: "include" });
