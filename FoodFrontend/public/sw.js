// Service Worker for Food App
// Handles push notifications, offline support, and background sync

// Check if we're in development mode by looking at the origin
const isDevelopment = self.location.hostname === 'localhost' && self.location.port === '5173';

// In development mode, don't do anything
if (isDevelopment) {
  // Don't log anything in development to reduce console noise
  // Don't register any event listeners in development
  self.addEventListener('install', () => {
    // Silent in development
  });
  self.addEventListener('activate', () => {
    // Silent in development
  });
  self.addEventListener('fetch', () => {
    // Silent in development
  });
  // Exit early for development mode
  return;
}

const CACHE_NAME = 'food-app-v1';
const STATIC_CACHE = 'food-app-static-v1';
const DYNAMIC_CACHE = 'food-app-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.origin.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('API request failed, trying cache:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'You are offline. Please check your connection.',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Static asset request failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Navigation request failed, trying cache:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/imagesStore/image.png',
      badge: data.badge || '/imagesStore/image.png',
      tag: data.tag || 'food-app-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };

    // Show notification
    event.waitUntil(
      self.registration.showNotification(data.title || 'Food App', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
    
    // Fallback notification
    const options = {
      body: 'You have a new notification from Food App',
      icon: '/imagesStore/image.png',
      badge: '/imagesStore/image.png'
    };
    
    event.waitUntil(
      self.registration.showNotification('Food App', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action) {
    // Handle custom actions
    handleNotificationAction(event.action, event.notification.data);
    return;
  }
  
  // Default click behavior
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view_order':
      if (data.orderId) {
        clients.openWindow(`/orders/${data.orderId}`);
      }
      break;
    case 'track_delivery':
      if (data.orderId) {
        clients.openWindow(`/delivery/${data.orderId}`);
      }
      break;
    case 'qr_validation':
      clients.openWindow('/qr-validation');
      break;
    default:
      console.log('Unknown notification action:', action);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'qr-verification-sync') {
    event.waitUntil(syncQRVerifications());
  }
});

// Sync offline QR verifications
async function syncQRVerifications() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Find offline QR verification requests
    const qrRequests = requests.filter(request => 
      request.url.includes('/drone/verify-qr') && 
      request.method === 'POST'
    );
    
    for (const request of qrRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Remove from cache if successful
          await cache.delete(request);
          console.log('Synced QR verification:', request.url);
        }
      } catch (error) {
        console.log('Failed to sync QR verification:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error event
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event);
});
