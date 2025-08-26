import { Router } from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { 
  sendSMSNotification,
  sendEmailNotification,
  sendPushNotification,
  savePushSubscription,
  getNotificationSettings,
  updateNotificationSettings,
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';

const router = Router();

// Main notification endpoints
router.get('/', verifyJWT, getNotifications);
router.post('/', verifyJWT, createNotification);
router.put('/:id/read', verifyJWT, markNotificationAsRead);
router.patch('/:id/read', verifyJWT, markNotificationAsRead); // Add PATCH for frontend compatibility
router.put('/read-all', verifyJWT, markAllNotificationsAsRead);
router.delete('/:id', verifyJWT, deleteNotification);
router.delete('/', verifyJWT, deleteAllNotifications);
router.get('/stats', verifyJWT, getNotificationStats);

// SMS notification
router.post('/send-sms', verifyJWT, sendSMSNotification);

// Email notification
router.post('/send-email', verifyJWT, sendEmailNotification);

// Push notification
router.post('/send-push', verifyJWT, sendPushNotification);

// Push subscription management
router.post('/push-subscription', verifyJWT, savePushSubscription);

// Notification settings
router.get('/settings', verifyJWT, getNotificationSettings);
router.put('/settings', verifyJWT, updateNotificationSettings);

export default router;
