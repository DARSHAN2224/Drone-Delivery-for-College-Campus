import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Store, 
  Heart,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  X
} from 'lucide-react';

const NotificationBanner = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    notifications, 
    dismissNotification,
    clearAllNotifications,
    resetStore,
    get,
    notificationsDisabled,
    toggleNotifications
  } = useNotificationStore();
  
  const [exitingNotifications, setExitingNotifications] = useState(new Set());

  // Handle notification exit animation
  const handleNotificationExit = (notificationId) => {
    setExitingNotifications(prev => new Set(prev).add(notificationId));
    
    // Remove from exiting state after animation completes
    setTimeout(() => {
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300); // Match CSS animation duration
  };

  // Handle manual close
  const handleClose = (notificationId) => {
    dismissNotification(notificationId);
    handleNotificationExit(notificationId);
  };

  // Filter out notifications that are exiting
  const visibleNotifications = notifications.filter(n => !exitingNotifications.has(n.id));

  if (visibleNotifications.length === 0) return null;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'info': return Info;
      case 'alert-circle': return AlertCircle;
      case 'check-circle': return CheckCircle;
      case 'shield': return Shield;
      case 'store': return Store;
      case 'heart': return Heart;
      case 'x-circle': return XCircle;
      case 'alert-triangle': return AlertTriangle;
      case 'shopping-bag': return ShoppingBag;
      default: return Info;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80 sm:w-96">
      {visibleNotifications.slice(0, 5).map((n, idx) => {
        const Icon = getIcon(n.icon);
        return (
          <div
            key={n.id}
            className={`toast-notification ${n.bgColor || 'bg-gray-800'} text-white rounded-lg shadow-xl p-4 flex items-start space-x-3 animate-in relative`}
            style={{ animationDelay: `${idx * 60}ms` }}
            onAnimationEnd={() => handleNotificationExit(n.id)}
          >
            <div className={`p-2 rounded-lg ${n.iconColor || 'bg-white/10'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{n.title}</p>
              {n.message && (
                <p className="text-xs opacity-90 mt-1">{n.message}</p>
              )}
              {Array.isArray(n.actions) && n.actions.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  {n.actions.map((a, i) => (
                    <button key={i} onClick={a.action} className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded">
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Close button */}
            <button
              onClick={() => handleClose(n.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      {visibleNotifications.length > 5 && (
        <div className="bg-gray-900/90 text-white rounded-lg shadow p-3 text-xs">
          +{visibleNotifications.length - 5} more notifications
        </div>
      )}
    </div>
  );
};

export default NotificationBanner;
