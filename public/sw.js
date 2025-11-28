self.addEventListener("push", (event) => {
    let data = { title: "Update", body: "New update", url: "/" };
    try {
        data = event.data.json();
    } catch (e) {}
    const options = {
        body: data.body,
        data: { url: data.url, mangaId: data.mangaId },
        tag: data.tag || `manga-${data.mangaId}`,
        renotify: data.renotify || false,
        actions: data.actions || [],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen =
        event.notification.data && event.notification.data.url
            ? event.notification.data.url
            : "/";

    event.waitUntil(
        (async () => {
            const allClients = await clients.matchAll({
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
                } catch (e) {}
            }
            // Not found -> open a new window/tab
            await clients.openWindow(urlToOpen);
        })()
    );
});
