import type {
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";
import type { Cookie } from "tough-cookie";
import { CookieJar } from "tough-cookie";
import { defaultMark } from "./mark";

declare module "axios" {
    interface AxiosRequestConfig {
        jar?: CookieJar;
    }
}

function parseCookies(headers: any): Cookie[] {
    let cookies: Cookie[] = [];
    if (Array.isArray(headers["set-cookie"])) {
        cookies = headers["set-cookie"];
    } else if (headers["set-cookie"]) {
        cookies = [headers["set-cookie"]!];
    }

    return cookies;
}

async function addCookiesToJar(cookies: Cookie[], jar: CookieJar, url: string) {
    for (const cookie of cookies) {
        await jar.setCookie(cookie, url);
    }
}

async function parseAndAddCookiesToJar(
    axios: AxiosInstance,
    response: AxiosResponse,
) {
    if (response?.headers && response.headers["set-cookie"]) {
        const config = response.config;
        return addCookiesToJar(
            parseCookies(response.headers),
            config.jar as CookieJar,
            axios.getUri(response.config)!,
        );
    }
}

export function ddosGuardBypass(axios: AxiosInstance): void {
    axios.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            if (config.jar) {
                // Get cookies valid for request and add them to headers, preserving exisiting cookies
                let existingCookies = config.headers["cookie"] || "";
                let newCookies = config.jar.getCookieStringSync(
                    axios.getUri(config)!,
                );
                if (newCookies) {
                    config.headers["cookie"] =
                        existingCookies +
                        (existingCookies ? "; " : "") +
                        newCookies;
                }
            } else {
                // Create new CookieJar instance if none provided
                config.jar = new CookieJar();
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    axios.interceptors.response.use(
        async (response) => {
            if (response.config.jar) {
                await parseAndAddCookiesToJar(axios, response);
            }

            return response;
        },
        async (error) => {
            if (error.config.jar) {
                await parseAndAddCookiesToJar(axios, error.response);
            }

            const status = error.response?.status;
            // Determine if the site is protected by DDoS Guard and our request got denied (403)
            if (
                status === 403 &&
                error.response?.headers?.server === "ddos-guard"
            ) {
                let origin = new URL(error.config.url).origin;

                // The site is protected, we try to bypass
                let guardCheckUrl = `${origin}/.well-known/ddos-guard/check?context=free_splash`;
                let resp = await axios({
                    url: guardCheckUrl,
                    headers: {
                        "User-Agent": error.config.headers["user-agent"],
                    },
                    proxy: error.config.proxy,
                });

                // Send a request with fake mark data
                let markUrl = `${origin}/.well-known/ddos-guard/mark/`;

                let mark = defaultMark;
                resp = await axios({
                    method: "POST",
                    url: markUrl,
                    data: mark,
                    headers: {
                        "User-Agent": error.config.headers["user-agent"],
                    },
                    proxy: error.config.proxy,
                });

                // Determine if we can reply the request
                // If will fail if some stream-like data was provided, so we only allow reply if we have buffer
                if (
                    error.config.data &&
                    !(error.config.data instanceof Buffer)
                ) {
                    throw new Error(
                        "Cannot reply request with non-buffer data",
                    );
                }

                // Reply the request
                return axios(error.config);
            } else {
                return Promise.reject(error);
            }
        },
    );
}
