"use client"
import { useEffect } from 'react'
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
  useEffect(() => {
    // CANDADO DEFINITIVO: Si ya se intentó en esta carga, salir.
    if (window.sessionStorage.getItem('push_attempted')) return;

    async function registerPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        // Marcamos que ya lo intentamos para que no entre en bucle si la red falla
        window.sessionStorage.setItem('push_attempted', 'true');

        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });
        
        // Enviamos al servidor sin bloquear la UI
        subscribeUser(JSON.parse(JSON.stringify(subscription)));
      } catch (error) {
        console.warn("PushLoader bloqueó un posible bucle por error de red.");
      }
    }

    // Le damos 5 segundos de gracia para que la App cargue todo antes de intentar el push
    const timer = setTimeout(registerPush, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}