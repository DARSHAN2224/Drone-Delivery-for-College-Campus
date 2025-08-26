export const markDeprecated = (message = "This endpoint is deprecated and will be removed in a future release.") => (req, _res, next) => {
  req.deprecated = true;
  if (process && process.env && process.env.NODE_ENV !== 'test') {
    console.warn(`[DEPRECATION] ${req.method} ${req.originalUrl} - ${message}`);
  }
  next();
};


