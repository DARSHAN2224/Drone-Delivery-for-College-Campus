import { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { 
  Bell, 
  X, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Store, 
  Heart,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  Clock,
  Trash2,
  Check
} from 'lucide-react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'all'
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount,
    getTotalCount
  } = useNotificationStore();

  const unreadCount = getUnreadCount();
  const totalCount = getTotalCount();
  
  // Debug logging (only when counts change)
  useEffect(() => {
    console.log('🔔 Notification counts:', { unreadCount, totalCount, notificationsCount: notifications.length });
  }, [unreadCount, totalCount, notifications.length]);

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (iconName) => {
    const icons = {
      info: Info,
      'alert-circle': AlertCircle,
      'check-circle': CheckCircle,
      shield: Shield,
      store: Store,
      heart: Heart,
      'x-circle': XCircle,
      'alert-triangle': AlertTriangle,
      'shopping-bag': ShoppingBag
    };
    return icons[iconName] || Info;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };
    return colorMap[type] || 'text-gray-500';
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification) => {
    const notifId = notification._id || notification.id;
    if (!notification.read && notifId) {
      markAsRead(notifId);
    }
    
    // Handle action if available
    if (notification.actions && notification.actions.length > 0) {
      const action = notification.actions[0];
      if (action.type === 'link') {
        window.location.href = action.action;
      } else if (action.type === 'function') {
        action.action();
      }
      setIsOpen(false);
    }
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    if (action.type === 'link') {
      window.location.href = action.action;
    } else if (action.type === 'function') {
      action.action();
    }
    setIsOpen(false);
  };

  const getCurrentNotifications = () => {
    if (activeTab === 'recent') {
      return notifications.slice(0, 10); // Show only recent 10
    }
    return notifications;
  };

  const currentNotifications = getCurrentNotifications();

  if (isLoading) {
    return (
      <div className="relative">
        <button className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
          <Bell className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-5 h-5">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {totalCount > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
            unreadCount > 0 ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header with Tabs */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {totalCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </button>
                )}
                {totalCount > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'recent'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({totalCount})
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {currentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {activeTab === 'recent' ? 'No recent notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {currentNotifications.map((notification) => {
                  const Icon = getIcon(notification.icon);
                  const iconColor = getTypeColor(notification.type);

                  return (
                    <div
                      key={notification._id || notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification._id || notification.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(notification.createdAt || notification.timestamp)}
                            </div>
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2">
                                {notification.actions.slice(0, 2).map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => handleAction(action, e)}
                                    className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {currentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="text-center text-sm text-gray-600">
                {unreadCount > 0 ? (
                  <span className="text-blue-600 font-medium">{unreadCount} unread</span>
                ) : (
                  <span>All caught up!</span>
                )}
                {activeTab === 'recent' && totalCount > 10 && (
                  <span className="ml-2">• {totalCount - 10} more in All tab</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
