import { useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

const Toast = () => {
  const { activeToast, dismissToast, markAsRead } = useNotificationStore();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'check-circle': return CheckCircle;
      case 'x-circle': return XCircle;
      case 'alert-triangle': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: 'text-green-100',
          border: 'border-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: 'text-red-100',
          border: 'border-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: 'text-yellow-100',
          border: 'border-yellow-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'text-blue-100',
          border: 'border-blue-600'
        };
    }
  };

  const Icon = getIcon(activeToast.icon);
  const styles = getTypeStyles(activeToast.type);

  const handleAction = (action) => {
    if (action.type === 'link') {
      window.location.href = action.action;
    } else if (action.type === 'function') {
      action.action();
    }
    dismissToast();
  };

  const handleClose = () => {
    dismissToast();
  };

  const handleClick = () => {
    if (!activeToast.read) {
      const id = activeToast._id || activeToast.id;
      if (id) markAsRead(id);
    }
    dismissToast();
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right-2 duration-300">
      <div 
        className={`${styles.bg} text-white rounded-lg shadow-xl border ${styles.border} p-4 cursor-pointer hover:shadow-2xl transition-all duration-200`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${styles.icon} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">
                  {activeToast.title}
                </h4>
                {activeToast.message && (
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">
                    {activeToast.message}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                title="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            {activeToast.actions && activeToast.actions.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                {activeToast.actions.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(action);
                    }}
                    className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-colors font-medium"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Unread indicator */}
            {!activeToast.read && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span className="text-xs opacity-75">Click to mark as read</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
