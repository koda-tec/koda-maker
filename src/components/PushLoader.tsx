"use client"
import { useEffect } from 'react'
import { subscribeUser } from '@/app/(private)/dashboard/actions-notifications'

// Función auxiliar para convertir la llave VAPID (Es obligatoria para que funcione)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushLoader() {
  useEffect(() => {
    async function registerPush() {
      // 1. Verificamos si el navegador soporta notificaciones
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Este navegador no soporta notificaciones Push.");
        return;
      }

      try {
        // 2. Esperamos a que el Service Worker esté listo
        const registration = await navigator.serviceWorker.ready;
        
        // 3. Pedimos permiso al usuario
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("El usuario rechazó las notificaciones.");
          return;
        }

        // 4. Suscribir al usuario
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        };

        const subscription = await registration.pushManager.subscribe(subscribeOptions);
        
        // 5. Enviar a la base de datos de Supabase
        await subscribeUser(JSON.parse(JSON.stringify(subscription)));
        console.log("✅ Dispositivo suscrito a Koda Maker");

      } catch (error) {
        console.error("❌ Error al suscribir al Push:", error);
      }
    }

    registerPush();
  }, []);

  return null;
}