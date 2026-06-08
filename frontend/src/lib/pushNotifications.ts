import { api } from './api'

export async function registerPushNotifications(): Promise<void> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return

  // Request permission — default to prompt, user can allow/deny
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? '',
      })
    }

    const json = subscription.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return

    await api.subscribePush({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    })
  } catch (err) {
    console.warn('Push registration failed:', err)
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return
    await api.unsubscribePush(subscription.endpoint)
    await subscription.unsubscribe()
  } catch (err) {
    console.warn('Push unregister failed:', err)
  }
}

