import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api.js';
import { io } from 'socket.io-client';

const getUserData = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user || parsed?.user || null;
  } catch (error) {
    console.warn('Failed to parse auth storage:', error);
    return null;
  }
};

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      activeToast: null,
      unreadCount: 0,
      isLoading: false,
      error: null,

      addNotification: async (notification) => {
        try {
          if (notification.metadata?.isApiError) {
            const localNotification = { ...notification, id: notification.id || `api_error_${Date.now()}`, timestamp: Date.now(), read: false };
            set(state => ({ notifications: [localNotification, ...state.notifications], unreadCount: state.unreadCount + 1 }));
            if (!get().activeToast) get().showToast(localNotification);
            return localNotification;
          }
          const user = getUserData();
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken || !user?._id) {
            const localNotification = { ...notification, id: notification.id || `local_${Date.now()}`, timestamp: Date.now(), read: false };
            set(state => ({ notifications: [localNotification, ...state.notifications], unreadCount: state.unreadCount + 1 }));
            if (!get().activeToast) get().showToast(localNotification);
            return localNotification;
          }
          const roleToModel = { user: 'User', seller: 'Seller', admin: 'Admin' };
          const userModel = notification.userModel || roleToModel[user?.role] || 'User';
          const userId = notification.userId || user?._id;
          const notificationData = { ...notification, id: notification.id || `notification_${Date.now()}`, timestamp: Date.now(), read: false, userId, userModel };
          const response = await api.post('/notifications', notificationData);
          const savedNotification = response.data.data;
          set(state => {
            const exists = state.notifications.some(n => n._id === savedNotification._id || n.id === savedNotification.id);
            return exists ? state : { notifications: [savedNotification, ...state.notifications], unreadCount: state.unreadCount + 1 };
          });
          if (!get().activeToast) get().showToast(savedNotification);
          return savedNotification;
        } catch (error) {
          console.error('Failed to create notification:', error);
          const fallbackNotification = { ...notification, id: notification.id || `fallback_${Date.now()}`, timestamp: Date.now(), read: false };
          set(state => ({ notifications: [fallbackNotification, ...state.notifications], unreadCount: state.unreadCount + 1 }));
          if (!get().activeToast) get().showToast(fallbackNotification);
          return fallbackNotification;
        }
      },

      addNotificationFromApi: async (response, type = 'info') => {
        const { data } = response;
        let message = '';
        let title = '';
        if (type === 'success') {
          title = 'Success';
          message = data?.message || 'Operation completed successfully';
        } else if (type === 'error') {
          title = 'Error';
          message = data?.error || data?.message || 'An error occurred';
        }
        const notification = { type, title, message, icon: type === 'success' ? 'check-circle' : 'x-circle', metadata: { apiResponse: data, timestamp: new Date().toISOString() } };
        return get().addNotification(notification);
      },

      showToast: (notification) => {
        set({ activeToast: notification });
        setTimeout(() => get().dismissToast(), 4000);
      },

      dismissToast: () => set({ activeToast: null }),

      markAsRead: async (notificationId) => {
        try {
          const target = get().notifications.find(n => n._id === notificationId || n.id === notificationId);
          if (!target || target._id) {
            await api.patch(`/notifications/${notificationId}/read`);
          }
          set(state => ({
            notifications: state.notifications.map(n => n._id === notificationId || n.id === notificationId ? { ...n, read: true } : n),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
          const current = get().activeToast;
          if (current && (current._id === notificationId || current.id === notificationId)) {
            get().dismissToast();
          }
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          set(state => ({
            notifications: state.notifications.map(n => n._id === notificationId || n.id === notificationId ? { ...n, read: true } : n),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        }
      },

      markAllAsRead: async () => {
        try {
          await api.put('/notifications/read-all');
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
          get().dismissToast();
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
        }
      },

      fetchNotifications: async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) return [];
          const userData = getUserData();
          if (!userData?._id) return [];
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isLoading: true, error: null });
          const response = await api.get('/notifications');
          const { notifications, unreadCount } = response.data.data;
          set(state => {
            const localOnly = state.notifications.filter(n => !n._id);
            const serverIds = new Set(notifications.map(n => n._id));
            const merged = [...notifications, ...localOnly.filter(n => !(n.id && serverIds.has(n.id)))];
            return { notifications: merged, unreadCount, isLoading: false };
          });
          return notifications;
        } catch (error) {
          console.error('Failed to fetch notifications:', error.message);
          set({ error: error.message || 'Failed to fetch notifications', isLoading: false });
          return [];
        }
      },

      subscribeLive: () => {
        // Skip Socket.IO in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Development mode: Socket.IO connection skipped');
          return;
        }
        
        try {
          const user = getUserData();
          if (!user?._id || get()._socketConnected) return;
          
          const socket = io('http://localhost:8000', { 
            withCredentials: true,
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
          });
          
          socket.on('connect', () => {
            console.log('🔌 Socket.IO connected successfully');
            socket.emit('join_notif', { userId: user._id });
          });
          
          socket.on('connect_error', (error) => {
            console.warn('🔌 Socket.IO connection error:', error.message);
          });
          
          socket.on('disconnect', (reason) => {
            console.log('🔌 Socket.IO disconnected:', reason);
            set({ _socketConnected: false });
          });
          
          socket.on('notification:new', (n) => {
            const exists = get().notifications.some(x => x._id === n._id);
            if (!exists) {
              set(state => ({ notifications: [n, ...state.notifications], unreadCount: state.unreadCount + 1 }));
              if (!get().activeToast) get().showToast(n);
            }
          });
          
          set({ _socketConnected: true });
        } catch (e) { 
          console.warn('🔌 Socket.IO setup error:', e.message);
        }
      },

      deleteNotification: async (notificationId) => {
        try {
          const target = get().notifications.find(n => n._id === notificationId || n.id === notificationId);
          if (!target || target._id) {
            await api.delete(`/notifications/${notificationId}`);
          }
          const notification = get().notifications.find(n => n._id === notificationId || n.id === notificationId);
          set(state => ({
            notifications: state.notifications.filter(n => n._id !== notificationId && n.id !== notificationId),
            unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          }));
          const current = get().activeToast;
          if (current && (current._id === notificationId || current.id === notificationId)) {
            get().dismissToast();
          }
        } catch (error) {
          console.error('Failed to delete notification:', error);
        }
      },

      deleteAllNotifications: async () => {
        try {
          await api.delete('/notifications');
          set({ notifications: [], unreadCount: 0 });
          get().dismissToast();
        } catch (error) {
          console.error('Failed to delete all notifications:', error);
        }
      },

      clearError: () => set({ error: null }),
      getUnreadCount: () => get().unreadCount,
      getTotalCount: () => get().notifications.length,
      getNotificationsByType: (type) => get().notifications.filter(n => n.type === type),
      getRecentNotifications: (limit = 10) => get().notifications.slice(0, limit)
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
);