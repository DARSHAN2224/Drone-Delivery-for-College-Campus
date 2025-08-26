import csurf from 'csurf';

// Initialize CSRF middleware
export const csrfProtection = csurf({ 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax' 
  } 
});

// CSRF error handler
export const handleCsrfErrors = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      error: 'Invalid CSRF token'
    });
  }
  next(err);
};
