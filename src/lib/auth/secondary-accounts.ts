import { MalAccount } from "./secondary-accounts/mal";
import { StorageManager } from "@/lib/storage";

export type SyncHandler = (
    data: components["schemas"]["ChapterResponse"]
) => Promise<boolean>;
export interface SecondaryAccount {
    id: string;
    name: string;
    color: string;
    textColor: string;

    getAuthUrl: () => string;
    logOut: () => Promise<boolean>;
    validate: () => Promise<boolean>;
    sync: SyncHandler;
}
export const SECONDARY_ACCOUNTS = [
    new MalAccount(),
] as const satisfies SecondaryAccount[];
export type SecondaryAccountId = (typeof SECONDARY_ACCOUNTS)[number]["id"];

export interface SmallSecondaryAccount {
    id: SecondaryAccountId;
    name: string;
    valid: boolean;
}

export async function isAccountValid(accountId: SecondaryAccountId) {
    const account = SECONDARY_ACCOUNTS.find((acc) => acc.id === accountId);
    if (!account) throw new Error(`Unknown account ID: ${accountId}`);

    const cacheStorage = StorageManager.get("secondaryAccountCache");
    const cache = cacheStorage.get({ accountId });

    if (cache?.valid) return true;

    const valid = await account.validate();
    cacheStorage.set({ valid }, { accountId });
    return valid;
}

export async function validateSecondaryAccounts(): Promise<
    SmallSecondaryAccount[]
> {
    const validAccounts = await Promise.all(
        SECONDARY_ACCOUNTS.map(async (account) => {
            return {
                id: account.id as SecondaryAccountId,
                name: account.name,
                valid: await isAccountValid(account.id),
            };
        })
    );

    return validAccounts;
}

export function getSecondaryAccountById(
    accountId: SecondaryAccountId
): SecondaryAccount | undefined {
    return SECONDARY_ACCOUNTS.find((acc) => acc.id === accountId);
}
