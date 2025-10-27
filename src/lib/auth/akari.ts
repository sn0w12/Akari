import { client } from "../api";
import { SecondaryAccount } from "./secondary-accounts";

export async function submitLogin(email: string, password: string) {
    const { data, error } = await client.POST("/v2/user/signin", {
        body: {
            email,
            password,
        },
    });

    if (error) {
        throw new Error(error.data.message || "Login failed");
    }

    return data.data;
}

export async function logOut(secondaryAccounts: SecondaryAccount[]) {
    secondaryAccounts.forEach(async (account) => {
        await account.logOut();
    });

    const { error } = await client.POST("/v2/user/signout");

    if (error) {
        throw new Error(error.data.message || "Logout failed");
    }
}
