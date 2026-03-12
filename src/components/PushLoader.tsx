"use client"
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { subscribeUser } from '@/app/(private)/dashboard/actions-notifications'

export function PushLoader() {
  useEffect(() => {
    async function register() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });
          
          await subscribeUser(JSON.parse(JSON.stringify(subscription)));
        }
      }
    }
    register();
  }, []);

  return null;
}