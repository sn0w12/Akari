/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope;

interface AkariPushMessageData extends PushMessageData {
    title: string;
    body: string;
    url: string;
    mangaId: string;
    tag: string;
    badge: number;
}

interface NotificationData {
    url: string;
    mangaId: string;
}

sw.addEventListener("push", (event) => {
    if (!event.data) return;

    try {
        const data: AkariPushMessageData = event.data.json();
        const options = {
            body: data.body,
            data: { url: data.url, mangaId: data.mangaId },
            tag: data.tag,
            renotify: false,
            actions: [],
        };
        event.waitUntil(sw.registration.showNotification(data.title, options));
        if (data.badge) {
            navigator.setAppBadge(Number(data.badge));
        }
    } catch {
        // Handle error if event.data.json() fails
    }
});

sw.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const data = event.notification.data as NotificationData;
    const urlToOpen = data && data.url ? data.url : "/";

    event.waitUntil(
        (async () => {
            const allClients = await sw.clients.matchAll({
                type: "window",
                includeUncontrolled: true,
            });
            // Try to focus existing tab with same origin + path
            for (const client of allClients) {
                try {
                    const clientUrl = new URL(client.url);
                    const targetUrl = new URL(urlToOpen, self.location.origin);
                    if (clientUrl.pathname === targetUrl.pathname) {
                        await client.focus();
                        return;
                    }
                } catch {}
            }
            // Not found -> open a new window/tab
            await sw.clients.openWindow(urlToOpen);
        })(),
    );
});
