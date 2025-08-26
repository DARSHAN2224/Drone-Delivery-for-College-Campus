import express from 'express';
import { verifyJWT, verifySellerJWT, verifyAdminJWT } from '../middlewares/authMiddleware.js';
import { 
    createDroneOrder,
    getDroneOrderStatus,
    updateDroneOrderStatus,
    verifyQRCodeDelivery,
    getAllDroneOrders,
    cancelDroneDelivery,
    assignDrone,
    launchDrone,
    landDrone,
    returnDrone,
    emergencyStop,
    getDroneStatus,
    getDroneStatusByOrder,
    getAllDrones,
    callDroneToShop
} from '../controllers/droneController.js';

const router = express.Router();

// Apply JWT verification for user endpoints by default
router.use(verifyJWT);

// Create drone delivery order
router.post('/create', createDroneOrder);

// Get drone order status
router.get('/status-by-order/:orderId', getDroneOrderStatus);

// Update drone order status (admin/seller)
router.patch('/update/:droneOrderId', async (req, res, next) => {
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
}, updateDroneOrderStatus);

// Verify QR code at delivery
router.post('/verify-qr', verifyQRCodeDelivery);

// Cancel drone delivery
router.post('/cancel/:droneOrderId', cancelDroneDelivery);

// Admin routes
router.get('/admin/all', (req, res, next) => verifyAdminJWT(req, res, next), getAllDroneOrders);
router.get('/admin/drones', (req, res, next) => verifyAdminJWT(req, res, next), getAllDrones);

// Assignment & control endpoints
router.post('/assign/:orderId', (req, res, next) => verifyAdminJWT(req, res, next), assignDrone);
router.post('/launch/:orderId', (req, res, next) => verifyAdminJWT(req, res, next), launchDrone);
router.post('/land/:droneId', (req, res, next) => verifyAdminJWT(req, res, next), landDrone);
router.post('/return/:droneId', (req, res, next) => verifyAdminJWT(req, res, next), returnDrone);
router.post('/emergency-stop/:droneId', (req, res, next) => verifyAdminJWT(req, res, next), emergencyStop);
router.get('/status/:droneId', (req, res, next) => verifyAdminJWT(req, res, next), getDroneStatus);
// Alias for clarity
router.get('/status-by-drone/:droneId', (req, res, next) => verifyAdminJWT(req, res, next), getDroneStatus);

// User-safe telemetry by order
router.get('/status-by-order/:orderId', verifyJWT, getDroneStatusByOrder);

// Seller endpoint to call drone to shop
router.post('/call-to-shop', (req, res, next) => verifySellerJWT(req, res, next), callDroneToShop);

export default router;
