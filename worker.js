// EVENTO PUSH: Escucha cuando llega el mensaje del servidor
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/icon-192x192.png',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: '/dashboard/pedidos' }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// EVENTO CLICK: Abre la app al tocar la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});