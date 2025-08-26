import { useNotificationStore } from '../stores/notificationStore';

// Global API interceptor for automatic notifications
export const setupApiInterceptors = (api) => {
  // Response interceptor
  api.interceptors.response.use(
    // Success response
    (response) => {
      const url = String(response.config.url || '');
      const method = String(response.config.method || 'get').toUpperCase();
      const data = response.data || {};

      // Skip endpoints that manage notifications or token refresh
      const isNotificationsEndpoint = /\/notifications(\b|\/)/.test(url);
      const isRefreshEndpoint = /(\/auth\/refresh|\/api\/v1\/(users|seller|admin)\/refresh(-token)?)/.test(url);
      const shouldSkip = isNotificationsEndpoint || isRefreshEndpoint;

      if (!shouldSkip) {
        const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
        const hasMessage = typeof data?.message === 'string' && data.message.length > 0;
        const shouldNotifyGet = method === 'GET' && (data?.notify === true);

        if ((isMutating && hasMessage) || shouldNotifyGet) {
          const { addNotificationFromApi } = useNotificationStore.getState();
          addNotificationFromApi(response, 'success');
        }
      }

      return response;
    },
    
    // Error response
    (error) => {
      // Extract error message from response
      let errorMessage = 'An error occurred';
      let errorTitle = 'Error';
      
      if (error.response) {
        const { data, status } = error.response;
        
        // Handle different error status codes
        switch (status) {
          case 400:
            errorTitle = 'Bad Request';
            errorMessage = data?.error || data?.message || 'Invalid request data';
            break;
          case 401:
            errorTitle = 'Unauthorized';
            errorMessage = data?.error || data?.message || 'Please log in to continue';
            break;
          case 403:
            errorTitle = 'Forbidden';
            errorMessage = data?.error || data?.message || 'You don\'t have permission to perform this action';
            break;
          case 404:
            errorTitle = 'Not Found';
            errorMessage = data?.error || data?.message || 'The requested resource was not found';
            break;
          case 409:
            errorTitle = 'Conflict';
            errorMessage = data?.error || data?.message || 'This operation conflicts with existing data';
            break;
          case 422:
            errorTitle = 'Validation Error';
            errorMessage = data?.error || data?.message || 'Please check your input data';
            break;
          case 429:
            errorTitle = 'Too Many Requests';
            errorMessage = data?.error || data?.message || 'Please wait before trying again';
            break;
          case 500:
            errorTitle = 'Server Error';
            errorMessage = data?.error || data?.message || 'Something went wrong on our end';
            break;
          default:
            errorTitle = 'Error';
            errorMessage = data?.error || data?.message || 'An unexpected error occurred';
        }
      } else if (error.request) {
        // Network error
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else {
        // Other error
        errorTitle = 'Error';
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      // Don't show notification for certain endpoints to avoid spam
      const urlStr = String(error.config?.url || '');
      const method = String(error.config?.method || 'get').toUpperCase();
      const data = error.response?.data || {};

      const isNotificationsEndpoint = /\/notifications(\b|\/)/.test(urlStr);
      const isRefreshEndpoint = /(\/auth\/refresh|\/api\/v1\/(users|seller|admin)\/refresh(-token)?)/.test(urlStr);
      const shouldSkip = isNotificationsEndpoint || isRefreshEndpoint;
      
      if (!shouldSkip) {
        const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
        const shouldNotifyGet = method === 'GET' && (data?.notify === true);

        if (isMutating || shouldNotifyGet) {
          // Show error notification - but don't persist it to avoid loops
          try {
            const { addNotification } = useNotificationStore.getState();
            addNotification({
              type: 'error',
              title: errorTitle,
              message: errorMessage,
              icon: 'x-circle',
              metadata: {
                status: error.response?.status,
                url: error.config?.url,
                method,
                timestamp: new Date().toISOString(),
                isApiError: true
              }
            });
          } catch (notificationError) {
            console.warn('Failed to create error notification:', notificationError);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // Request interceptor (optional - for logging)
  api.interceptors.request.use(
    (config) => {
      // Log requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Export the setup function
export default setupApiInterceptors;
