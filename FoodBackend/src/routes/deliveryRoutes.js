import { Router } from 'express';
import { verifyJWT, verifySellerJWT, verifyAdminJWT } from '../middlewares/authMiddleware.js';
import { 
    upsertDelivery, 
    getDelivery, 
    getAllDeliveries, 
    markDeliveryCompleted, 
    mockRegularDelivery, 
    verifyQRDelivery,
    generateTestQR
} from '../controllers/deliveryController.js';

const router = Router();

// Admin/seller can upsert; protect behind seller or admin auth
const allowSellerOrAdmin = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => verifySellerJWT(req, res, (err) => err ? reject(err) : resolve()));
    return next();
  } catch (_) {}
  try {
    await new Promise((resolve, reject) => verifyAdminJWT(req, res, (err) => err ? reject(err) : resolve()));
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: null });
  }
};

// Regular delivery tracking
router.put('/track/:orderId', allowSellerOrAdmin, upsertDelivery);
router.get('/track/:orderId', verifyJWT, getDelivery);

// Admin endpoints
router.get('/admin/all', (req, res, next) => verifyAdminJWT(req, res, next), getAllDeliveries);
router.put('/admin/complete/:deliveryId', (req, res, next) => verifyAdminJWT(req, res, next), markDeliveryCompleted);

// Mock endpoints for testing
router.put('/mock-regular/:orderId', (req, res, next) => verifyAdminJWT(req, res, next), mockRegularDelivery);
router.post('/mock-qr/:orderId', (req, res, next) => verifyAdminJWT(req, res, next), generateTestQR);

// QR verification for drone delivery
router.post('/verify-qr', verifyJWT, verifyQRDelivery);

export default router;


