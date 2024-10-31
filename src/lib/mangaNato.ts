import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function getUserData(cookieStore: ReadonlyRequestCookies) {
    const userAccCookie = cookieStore.get("user_acc")?.value || "{}";
    const userAcc = JSON.parse(userAccCookie);

    if (!userAcc) {
        return null;
    }

    return userAcc.user_data;
}
