/**
 * Servicio de notificaciones push
 * Maneja las notificaciones push y en tiempo real de la aplicación
 */

import { getSupabaseClient } from '../supabase-client'

export interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  timestamp: number
}

export interface NotificationSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class PushNotificationService {
  private isSupported: boolean = false
  private isSubscribed: boolean = false
  private subscription: PushSubscription | null = null
  private registration: ServiceWorkerRegistration | null = null

  constructor() {
    this.checkSupport()
  }

  /**
   * Verifica si las notificaciones push están soportadas
   */
  private checkSupport(): void {
    this.isSupported = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  }

  /**
   * Inicializa el servicio de notificaciones
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Las notificaciones push no están soportadas en este navegador')
      return false
    }

    try {
      // Registrar el service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registrado:', this.registration)

      // Verificar si ya hay una suscripción
      this.subscription = await this.registration.pushManager.getSubscription()
      this.isSubscribed = !!this.subscription

      return true
    } catch (error) {
      console.error('Error inicializando notificaciones push:', error)
      return false
    }
  }

  /**
   * Solicita permisos para notificaciones
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    console.log('Permiso de notificaciones:', permission)
    return permission
  }

  /**
   * Suscribe al usuario a las notificaciones push
   */
  async subscribe(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.registration || !this.isSupported) {
      console.error('Service Worker no registrado o no soportado')
      return null
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      console.warn('Permisos de notificación denegados')
      return null
    }

    try {
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      this.isSubscribed = true
      console.log('Suscripción a push notifications creada:', this.subscription)

      // Guardar la suscripción en Supabase
      await this.saveSubscription(this.subscription)

      return this.subscription
    } catch (error) {
      console.error('Error suscribiendo a notificaciones push:', error)
      return null
    }
  }

  /**
   * Desuscribe al usuario de las notificaciones push
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true
    }

    try {
      const success = await this.subscription.unsubscribe()
      if (success) {
        this.subscription = null
        this.isSubscribed = false
        
        // Eliminar la suscripción de Supabase
        await this.removeSubscription()
      }
      return success
    } catch (error) {
      console.error('Error desuscribiendo de notificaciones push:', error)
      return false
    }
  }

  /**
   * Muestra una notificación local
   */
  async showNotification(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.warn('No se pueden mostrar notificaciones')
      return
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icon-192x192.png',
          badge: notification.badge || '/icon-72x72.png',
          tag: notification.tag,
          data: notification.data,
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'Ver'
            },
            {
              action: 'dismiss',
              title: 'Descartar'
            }
          ]
        })
      } else {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/icon-192x192.png',
          tag: notification.tag,
          data: notification.data
        })
      }
    } catch (error) {
      console.error('Error mostrando notificación:', error)
    }
  }

  /**
   * Guarda la suscripción en Supabase
   */
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const client = await getSupabaseClient()
      const user = await client.auth.getUser()
      
      if (!user.data.user) {
        console.warn('Usuario no autenticado, no se puede guardar la suscripción')
        return
      }

      const subscriptionData = {
        user_id: user.data.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh') ? 
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
        auth: subscription.getKey('auth') ? 
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null,
        created_at: new Date().toISOString()
      }

      const { error } = await client
        .from('push_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' })

      if (error) {
        console.error('Error guardando suscripción:', error)
      }
    } catch (error) {
      console.error('Error guardando suscripción en Supabase:', error)
    }
  }

  /**
   * Elimina la suscripción de Supabase
   */
  private async removeSubscription(): Promise<void> {
    try {
      const client = await getSupabaseClient()
      const user = await client.auth.getUser()
      
      if (!user.data.user) {
        return
      }

      const { error } = await client
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.data.user.id)

      if (error) {
        console.error('Error eliminando suscripción:', error)
      }
    } catch (error) {
      console.error('Error eliminando suscripción de Supabase:', error)
    }
  }

  /**
   * Convierte una clave VAPID de base64 a Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Getters para el estado del servicio
   */
  get supported(): boolean {
    return this.isSupported
  }

  get subscribed(): boolean {
    return this.isSubscribed
  }

  get currentSubscription(): PushSubscription | null {
    return this.subscription
  }
}

// Instancia singleton del servicio
export const pushNotificationService = new PushNotificationService()
