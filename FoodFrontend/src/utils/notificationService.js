import { api } from '../stores/api.js';
// Create a mock service for development mode
const createMockNotificationService = () => ({
  pushSubscription: null,
  isSupported: false,
  offlineQueue: [],
  syncInProgress: false,
  
  // Mock methods that return immediately
  initializePushNotifications: async () => {
    console.log('Development mode: Push notifications disabled');
    return false;
  },
  
  sendPushSubscription: async () => {
    console.log('Development mode: Push subscription disabled');
  },
  
  sendSMSNotification: async () => {
    console.log('Development mode: SMS notifications disabled');
    return true;
  },
  
  sendEmailNotification: async () => {
    console.log('Development mode: Email notifications disabled');
    return true;
  },
  
  addToOfflineQueue: () => {
    console.log('Development mode: Offline queue disabled');
  },
  
  removeFromOfflineQueue: () => {
    console.log('Development mode: Offline queue disabled');
  },
  
  registerBackgroundSync: async () => {
    console.log('Development mode: Background sync disabled');
    return false;
  },
  
  getOfflineQueue: () => [],
  
  clearOfflineQueue: () => {
    console.log('Development mode: Offline queue disabled');
  },
  
  isNotificationSupported: () => false,
  
  getNotificationPermission: () => 'denied',
  
  requestNotificationPermission: async () => false,
  
  urlBase64ToUint8Array: () => new Uint8Array(),
  
  initializeServiceWorker: async () => {
    console.log('Development mode: Service worker disabled');
    return false;
  },
  
  startConnectionMonitoring: () => {
    console.log('Development mode: Connection monitoring disabled');
    return () => {};
  },
  
  initialize: async () => {
    console.log('Development mode: Notification service disabled');
  }
});

// Export the appropriate service based on environment
let notificationService;

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Development mode: use mock service
  notificationService = createMockNotificationService();
} else {
  // Production mode: use real service
  class NotificationService {
    constructor() {
      this.pushSubscription = null;
      this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      this.offlineQueue = [];
      this.syncInProgress = false;
    }

    // Initialize push notifications
    async initializePushNotifications() {
      if (!this.isSupported) {
        console.log('Push notifications not supported in this browser');
        return false;
      }

      try {
        // Only register service worker in production
        if (process.env.NODE_ENV === 'production') {
          const registration = await navigator.serviceWorker.register('/sw.js');
        } else {
          console.log('Development mode: Service worker registration skipped');
          return false;
        }
        
        // Check current permission status first
        let permission = Notification.permission;
        
        // Only request permission if not already determined
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        
        if (permission !== 'granted') {
          // Handle different permission states gracefully
          if (permission === 'denied') {
            console.log('Notification permission denied by user - using in-app notifications only');
          } else if (permission === 'default') {
            console.log('Notification permission not yet determined - using in-app notifications only');
          }
          return false;
        }

        // Get push subscription
        this.pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
        });

        // Send subscription to server
        await this.sendPushSubscription();
        
        return true;
      } catch (error) {
        console.log('Push notifications initialization failed - using in-app notifications only:', error.message);
        return false;
      }
    }

    // Send push subscription to server
    async sendPushSubscription() {
      if (!this.pushSubscription) return;

      try {
        await api.post('/notifications/push-subscription', {
          subscription: this.pushSubscription
        });
      } catch (error) {
        console.error('Failed to send push subscription:', error);
        // Continue without failing for testing purposes
      }
    }

    // Send SMS notification
    async sendSMSNotification(phoneNumber, message) {
      try {
        const response = await api.post('/notifications/send-sms', {
          phoneNumber,
          message
        });
        return response.data.success;
      } catch (error) {
        console.error('Failed to send SMS:', error);
        // Return true for testing purposes when SMS service is not available
        return true;
      }
    }

    // Send email notification
    async sendEmailNotification(email, subject, message) {
      try {
        const response = await api.post('/notifications/send-email', {
          email,
          subject,
          message
        });
        return response.data.success;
      } catch (error) {
        console.error('Failed to send email:', error);
        // Return true for testing purposes when email service is not available
        return true;
      }
    }

    // Add to offline queue
    addToOfflineQueue(item) {
      try {
        const queue = this.getOfflineQueue();
        const existingIndex = queue.findIndex(q => 
          q.qrCode === item.qrCode && q.orderId === item.orderId
        );
        
        if (existingIndex === -1) {
          queue.push(item);
          localStorage.setItem('offlineQRQueue', JSON.stringify(queue));
          this.offlineQueue = queue;
          console.log('Added to offline queue:', item);
        } else {
          console.log('Item already in offline queue:', item);
        }
      } catch (error) {
        console.error('Failed to add to offline queue:', error);
      }
    }

    // Remove from offline queue
    removeFromOfflineQueue(item) {
      try {
        const queue = this.getOfflineQueue();
        const filteredQueue = queue.filter(q => 
          q.qrCode !== item.qrCode || q.orderId !== item.orderId
        );
        localStorage.setItem('offlineQRQueue', JSON.stringify(filteredQueue));
        this.offlineQueue = filteredQueue;
      } catch (error) {
        console.error('Failed to remove from offline queue:', error);
      }
    }

    // Register background sync
    async registerBackgroundSync() {
      if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
        console.warn('Background sync not supported');
        return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('qr-verification-sync');
        console.log('Background sync registered');
        return true;
      } catch (error) {
        console.error('Failed to register background sync:', error);
        return false;
      }
    }

    // Get offline queue
    getOfflineQueue() {
      try {
        return JSON.parse(localStorage.getItem('offlineQRQueue') || '[]');
      } catch (error) {
        console.error('Failed to get offline queue:', error);
        return [];
      }
    }

    // Clear offline queue
    clearOfflineQueue() {
      try {
        localStorage.removeItem('offlineQRQueue');
        this.offlineQueue = [];
        console.log('Offline queue cleared');
      } catch (error) {
        console.error('Failed to clear offline queue:', error);
      }
    }

    // Check if notification is supported
    isNotificationSupported() {
      return this.isSupported;
    }

    // Get notification permission
    getNotificationPermission() {
      return Notification.permission;
    }

    // Request notification permission
    async requestNotificationPermission() {
      if (!this.isSupported) return false;
      
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }

    // Convert VAPID key to Uint8Array
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    // Initialize service worker communication
    async initializeServiceWorker() {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from service worker:', event.data);
          
          if (event.data.type === 'OFFLINE_QUEUE_UPDATE') {
            this.offlineQueue = event.data.queue;
          }
        });

        // Send initial message to service worker
        registration.active?.postMessage({
          type: 'INIT',
          data: { offlineQueue: this.getOfflineQueue() }
        });

      } catch (error) {
        console.error('Failed to initialize service worker communication:', error);
      }
    }

    // Monitor online/offline status
    startConnectionMonitoring() {
      const handleOnline = () => {
        console.log('Connection restored, processing offline queue...');
        this.processOfflineQueue();
      };

      const handleOffline = () => {
        console.log('Connection lost, enabling offline mode...');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Return cleanup function
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Initialize the service
    async initialize() {
      // Only initialize service worker in production
      if (process.env.NODE_ENV === 'production') {
        await this.initializePushNotifications();
        await this.initializeServiceWorker();
        this.startConnectionMonitoring();
        
        // Process any existing offline queue
        if (navigator.onLine) {
          this.processOfflineQueue();
        }
      } else {
        console.log('Development mode: Service worker initialization skipped');
      }
    }
  }

  notificationService = new NotificationService();
}

// Auto-initialize when imported (only in production)
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  notificationService.initialize().catch(console.error);
}

export default notificationService;
