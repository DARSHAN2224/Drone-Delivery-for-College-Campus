import { Router } from 'express';
const sellerRouter = Router();
import {
     loginSeller,
     logoutSeller,
     refreshAccessToken,
     registerSeller,
     getCurrentSeller,
     viewProfile,
     updateSellerProfile,
     changeCurrentPassword,
     getSellerDashboard,
     getSellerHome,
     getSellerShops,
     getSellerProducts,
     createShop,
     updateShop,
     deleteShop,
     deleteSellerShop,
     createProduct,
     updateProduct,
     deleteProduct,
     getSellerStats,
     getSellerOrders,
     updateOrderStatus,
     deleteSellerAccount
} from '../controllers/sellerController.js';
import {
     getSellerOffers,
     createOffer,
     updateOffer,
     deleteOffer
} from '../controllers/offersController.js';
import { upload } from "../middlewares/multerMiddleware.js"
import { verifyJWT, verifySellerJWT, checkAlreadyAuthenticated } from '../middlewares/authMiddleware.js';
import { onlySellerAccess } from '../middlewares/sellerMiddleware.js';
import { loginRateLimiter, signupRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { accountLockoutMiddleware } from '../middlewares/accountLockoutMiddleware.js';
import { registerValidator, loginValidator } from '../utils/validator.js'

// Authentication routes - protected from already authenticated users
sellerRouter.route("/register").post(checkAlreadyAuthenticated, signupRateLimiter, registerValidator, registerSeller);
sellerRouter.route("/login").post(checkAlreadyAuthenticated, loginRateLimiter, accountLockoutMiddleware, loginValidator, loginSeller);
sellerRouter.route("/logout").post(verifySellerJWT, onlySellerAccess, logoutSeller);
sellerRouter.route("/refresh-token").post(refreshAccessToken);

// Profile routes
sellerRouter.get("/profile", verifySellerJWT, onlySellerAccess, getCurrentSeller);
sellerRouter.get("/viewProfile", verifySellerJWT, onlySellerAccess, viewProfile);
sellerRouter.patch("/profile", verifySellerJWT, onlySellerAccess, updateSellerProfile);
sellerRouter.post("/change-password", verifySellerJWT, onlySellerAccess, changeCurrentPassword);

// Dashboard and stats
sellerRouter.get('/dashboard', verifySellerJWT, onlySellerAccess, getSellerDashboard);
sellerRouter.get('/home', verifySellerJWT, onlySellerAccess, getSellerHome);
sellerRouter.get('/stats', verifySellerJWT, onlySellerAccess, getSellerStats);

// Shop routes
sellerRouter.get('/shops', verifySellerJWT, onlySellerAccess, getSellerShops);
sellerRouter.get('/shop', verifySellerJWT, onlySellerAccess, getSellerShops); // Alias for frontend compatibility
sellerRouter.post('/shops', verifySellerJWT, onlySellerAccess, upload.single('image'), createShop);
sellerRouter.patch('/shops/:shopId', verifySellerJWT, onlySellerAccess, upload.single('image'), updateShop);
sellerRouter.delete('/shops/:shopId', verifySellerJWT, onlySellerAccess, deleteShop);
sellerRouter.delete('/shop', verifySellerJWT, onlySellerAccess, deleteSellerShop); // Alias for frontend compatibility

// Product routes
sellerRouter.get('/products', verifySellerJWT, onlySellerAccess, getSellerProducts);
sellerRouter.post('/products', verifySellerJWT, onlySellerAccess, upload.single('image'), createProduct);
sellerRouter.patch('/products/:productId', verifySellerJWT, onlySellerAccess, upload.single('image'), updateProduct);
sellerRouter.delete('/products/:productId', verifySellerJWT, onlySellerAccess, deleteProduct);

// Offer routes
sellerRouter.get('/offers', verifySellerJWT, onlySellerAccess, getSellerOffers);
sellerRouter.post('/offers', verifySellerJWT, onlySellerAccess, createOffer);
sellerRouter.patch('/offers/:offerId', verifySellerJWT, onlySellerAccess, updateOffer);
sellerRouter.delete('/offers/:offerId', verifySellerJWT, onlySellerAccess, deleteOffer);

// Order management routes
sellerRouter.get('/orders', verifySellerJWT, onlySellerAccess, getSellerOrders);
sellerRouter.patch('/orders/status', verifySellerJWT, onlySellerAccess, updateOrderStatus);

// Account management routes
sellerRouter.delete('/account', verifySellerJWT, onlySellerAccess, deleteSellerAccount);

export default sellerRouter;

