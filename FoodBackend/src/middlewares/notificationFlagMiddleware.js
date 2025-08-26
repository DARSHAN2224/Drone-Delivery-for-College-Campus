export const attachNotifyFlag = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    try {
      // Attach deprecation meta if request was marked deprecated
      if (req.deprecated && payload && typeof payload === 'object' && !('deprecated' in payload)) {
        payload.deprecated = true;
      }
      // Only operate on plain objects
      if (payload && typeof payload === 'object') {
        const method = String(req.method || 'GET').toUpperCase();
        const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

        // Respect explicit notify from controllers
        const hasExplicitNotify = Object.prototype.hasOwnProperty.call(payload, 'notify');

        if (isMutating) {
          // For mutating requests, auto-enable notify when success and message present, unless explicitly set
          if (!hasExplicitNotify) {
            const hasMessage = typeof payload.message === 'string' && payload.message.length > 0;
            const isSuccess = payload.success === true || (typeof payload.statusCode === 'number' && payload.statusCode < 400);
            if (isSuccess && hasMessage) {
              payload.notify = true;
            }
          }
        } else {
          // For GET, do not auto-enable; ensure boolean form if not present
          if (!hasExplicitNotify) {
            payload.notify = false;
          }
        }
      }
    } catch (_) {
      // Swallow middleware errors; don't block response
    }
    return originalJson(payload);
  };

  next();
};


