/// <reference lib="webworker" />

export default null;
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | { url: string; revision: string })[];
};

// Escuchador de Notificaciones Push
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options: NotificationOptions & { vibrate?: number[] } = {
      body: data.body || data.message,
      icon: "/icon-192x192.png",
      badge: "/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/dashboard/pedidos",
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error("Error procesando notificación push:", error);
  }
});

// Escuchador de Clics en la notificación
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0] as WindowClient;
        for (let i = 0; i < clientList.length; i++) {
            if ((clientList[i] as WindowClient).focused) {
                client = clientList[i] as WindowClient;
            }
        }
        return client.focus();
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});