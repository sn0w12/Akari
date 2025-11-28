import { client } from "../api";

export async function registerAndSubscribe(vapidPublicKey?: string) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push not supported");
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
        localStorage.setItem("pushNotificationsDeclined", "true");
        throw new Error("Permission denied");
    }

    // First check if there is already an existing subscription. If so, use it.
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription && vapidPublicKey && vapidPublicKey.trim() !== "") {
        // No existing subscription found — create a fresh one using the provided VAPID key.
        subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
    }

    // If we have a subscription object now, send it to our API so the server can
    // start sending notifications. If we don't have a subscription because the
    // VAPID key wasn't available, mark the user as pending so we can attempt
    // completion later when the key is present.
    if (subscription) {
        const { endpoint, keys } = subscription.toJSON();
        const { p256dh, auth } = keys || {};

        if (!endpoint || !p256dh || !auth) {
            throw new Error("Invalid subscription data");
        }

        const { error } = await client.POST("/v2/notifications/subscribe", {
            body: {
                endpoint,
                p256dh,
                auth,
            },
        });

        if (error) {
            throw new Error(error.data.message || "Subscription failed");
        }

        // Clear any pending flags and return the subscription.
        localStorage.removeItem("pushNotificationsPending");
        return { status: "subscribed", subscription } as const;
    }

    // No subscription was created/sent: VAPID key missing — flag pending so
    // we can attempt to complete the flow later when the server key is known.
    localStorage.setItem("pushNotificationsPending", "true");
    return { status: "pending", subscription: null } as const;
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
}
