import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [usernameClient(), passkeyClient()],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    requestPasswordReset,
    resetPassword,
} = authClient;
