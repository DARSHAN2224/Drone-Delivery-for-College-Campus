import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { handleCsrfErrors } from './middlewares/csrfMiddleware.js';
import { sanitizeBody } from './middlewares/inputSanitizationMiddleware.js';
import { attachNotifyFlag } from './middlewares/notificationFlagMiddleware.js';

const app = express();

// CORS configuration (single instance)
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Apply input sanitization AFTER body parsing
app.use(sanitizeBody); // Re-enabled for production
// Auto-attach notify flag to responses per method/message
app.use(attachNotifyFlag);

// Routes
import sellerRouter from './routes/sellerRoutes.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import deliveryRouter from './routes/deliveryRoutes.js';
import droneRouter from './routes/droneRoutes.js';
import ratingRouter from './routes/ratingRoutes.js';
import likeRouter from './routes/likeRoutes.js';
import favoriteRouter from './routes/favoriteRoutes.js';
import recentHistoryRouter from './routes/recentHistoryRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import documentationRouter from './routes/documentationRoutes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/delivery", deliveryRouter);
app.use("/api/v1/drone", droneRouter);
app.use("/api/v1/ratings", ratingRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/history", recentHistoryRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/documentation", documentationRouter);

// Socket.IO health check endpoint
app.get('/socket.io/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Socket.IO server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(handleCsrfErrors);

export { app };

