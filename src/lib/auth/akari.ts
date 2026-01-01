import { createClient } from "./client";
import { SecondaryAccount } from "./secondary-accounts";

export async function logOut(secondaryAccounts: SecondaryAccount[]) {
    secondaryAccounts.forEach(async (account) => {
        await account.logOut();
        account.invalidate();
    });

    const supabase = createClient();
    await supabase.auth.signOut();
}
