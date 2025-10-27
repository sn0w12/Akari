import { checkMalAuthorization, logOutMal } from "./secondary-accounts/mal";

export interface SecondaryAccount {
    id: string;
    name: string;
    displayName: string;
    user: { name: string } | null;
    authUrl?: string;
    buttonColor: string;
    hoverColor: string;
    storageKey: string;
    sessionKey: string;
    logOut: () => Promise<boolean>;
    validate: () => Promise<boolean>;
}
export const SECONDARY_ACCOUNTS = [
    {
        id: "mal",
        name: "MyAnimeList",
        displayName: "MAL",
        user: null,
        buttonColor: "bg-blue-600",
        hoverColor: "hover:bg-blue-500",
        storageKey: "mal_user",
        sessionKey: "mal",
        logOut: logOutMal,
        validate: checkMalAuthorization,
    },
] as const satisfies SecondaryAccount[];
export type SecondaryAccountId = (typeof SECONDARY_ACCOUNTS)[number]["id"];

export async function isAccountValid(accountId: SecondaryAccountId) {
    const account = SECONDARY_ACCOUNTS.find((acc) => acc.id === accountId);
    if (!account) throw new Error(`Unknown account ID: ${accountId}`);

    const cache = sessionStorage.getItem(account.sessionKey);
    if (cache === "true") return true;
    if (cache === "false") return false;

    const valid = await account.validate();

    sessionStorage.setItem(account.sessionKey, valid ? "true" : "false");
    return valid;
}

export async function validateSecondaryAccounts() {
    const validAccounts = await Promise.all(
        SECONDARY_ACCOUNTS.map(async (account) => {
            return {
                id: account.id,
                name: account.name,
                valid: await isAccountValid(account.id),
            };
        })
    );

    console.log("Validated secondary accounts:", validAccounts);
    return validAccounts;
}
