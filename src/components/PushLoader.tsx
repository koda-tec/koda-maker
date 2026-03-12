"use client"
import { useEffect, useRef } from 'react'
import { subscribeUser } from '@/app/(private)/dashboard/actions-notifications'

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
  const hasSubscribed = useRef(false); // Candado para evitar doble ejecución

  useEffect(() => {
    // Si ya se intentó suscribir en esta carga de página, no hacer nada
    if (hasSubscribed.current) return;

    async function registerPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        hasSubscribed.current = true; // Marcamos como intentado
        
        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });
        
        // Enviamos al servidor de forma silenciosa
        await subscribeUser(JSON.parse(JSON.stringify(subscription)));
        console.log("✅ Dispositivo sincronizado");

      } catch (error) {
        console.error("Error en PushLoader:", error);
      }
    }

    registerPush();
  }, []);

  return null;
}