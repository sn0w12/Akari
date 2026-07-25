import { authClient } from "./client";
import { SecondaryAccount } from "./secondary-accounts";

export async function logOut(secondaryAccounts: SecondaryAccount[]) {
    await Promise.all(
        secondaryAccounts.map(async (account) => {
            await account.logOut();
            account.invalidate();
        }),
    );

    await authClient.signOut();
}
