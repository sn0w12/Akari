import { client } from "../api";

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
