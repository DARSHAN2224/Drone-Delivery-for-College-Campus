import { Router } from 'express';
const userRouter =  Router();
import { loginUser, logoutUser, refreshAccessToken, registerUser,verifyEmail,forgotPassword,resetPassword,getDeviceDetails,viewProfile,loadEditProfile,updateEditProfile,getTopProducts ,loadHome, listShops, getShopById, getProductsByShop, listUserOrders, listUserOrderHistory, createOrder, resendVerificationCode, testDatabase, createTestProducts, approveAllProducts, testBackend, testShopInfo, testApproveProducts, testShopProducts, archiveCompletedOrders, testMarkOrderCompleted, testShopStatus, testApproveShop} from '../controllers/userController.js';
import { getPageBySlug } from '../controllers/staticPageController.js';
import {upload} from "../middlewares/multerMiddleware.js"
import {verifyJWT, checkAlreadyAuthenticated} from '../middlewares/authMiddleware.js';
import { registerValidator,loginValidator,resetPasswordValidator ,forgetPasswordValidator,updateUserValidator, orderCreateValidator} from '../utils/validator.js'
import { markDeprecated } from '../middlewares/deprecationMiddleware.js';
import { loginRateLimiter, signupRateLimiter, passwordResetRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { accountLockoutMiddleware } from '../middlewares/accountLockoutMiddleware.js';

// Authentication routes - protected from already authenticated users
userRouter.route("/register").post(checkAlreadyAuthenticated, signupRateLimiter, registerValidator, registerUser);
userRouter.route("/login").post(checkAlreadyAuthenticated, loginRateLimiter, accountLockoutMiddleware, loginValidator, loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route('/device-info').get(getDeviceDetails);
userRouter.route('/verify-email').post(checkAlreadyAuthenticated, verifyEmail);
userRouter.route('/resend-verification').post(checkAlreadyAuthenticated, resendVerificationCode);
userRouter.route('/forgot-password').post(checkAlreadyAuthenticated, passwordResetRateLimiter, forgetPasswordValidator, forgotPassword);
userRouter.route('/reset-password/:token').post(checkAlreadyAuthenticated, resetPasswordValidator, resetPassword);


userRouter.get("/viewProfile",verifyJWT,viewProfile)
userRouter.get("/edit-profile",verifyJWT,loadEditProfile)
userRouter.post("/update-profile",verifyJWT, upload.single('image'),updateUserValidator,updateEditProfile)

userRouter.get('/home', verifyJWT,loadHome);




userRouter.get('/topproduct', verifyJWT,getTopProducts);

// Guard dev-only test endpoints
const allowDevOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found', data: null });
  }
  next();
};

// Test endpoint to check database content
userRouter.get('/test-database', allowDevOnly, verifyJWT, testDatabase);

// Simple backend test endpoint (no auth required)
userRouter.get('/test-backend', allowDevOnly, testBackend);

// Test shop info endpoint (no auth required)
userRouter.get('/test-shop-info', allowDevOnly, testShopInfo);

// Test approve products endpoint (no auth required)
userRouter.post('/test-approve-products', allowDevOnly, testApproveProducts);

// Test shop products endpoint (no auth required)
userRouter.get('/test-shop-products/:shopId', allowDevOnly, testShopProducts);

// Test endpoint to create test products
userRouter.post('/create-test-products', verifyJWT, createTestProducts);

// Test endpoint to approve all products
userRouter.post('/approve-all-products', verifyJWT, approveAllProducts);

// Test endpoint to check shop status
userRouter.get('/test-shop-status/:shopId', verifyJWT, testShopStatus);

// Test endpoint to approve a shop
userRouter.post('/test-approve-shop/:shopId', verifyJWT, testApproveShop);

// Public static pages (no auth needed)
userRouter.get('/pages/:slug', getPageBySlug);

// User shop endpoints
userRouter.get('/shops', verifyJWT, listShops);
userRouter.get('/shops/:shopId', verifyJWT, getShopById);
userRouter.get('/shops/:shopId/products', verifyJWT, getProductsByShop);

// User orders endpoints (REST primary)
import { getUserOrderById, cancelUserOrder, deleteSelfAccount } from '../controllers/userController.js';
userRouter.get('/orders', verifyJWT, listUserOrders);
userRouter.get('/orders/:id', verifyJWT, getUserOrderById);
userRouter.post('/orders', verifyJWT, orderCreateValidator, createOrder);
userRouter.patch('/orders/:id/cancel', verifyJWT, cancelUserOrder);
userRouter.post('/orders/archive-completed', verifyJWT, archiveCompletedOrders);
userRouter.patch('/orders/:orderId/test-complete', verifyJWT, testMarkOrderCompleted);
// Legacy
userRouter.get('/order-history', markDeprecated('Use GET /orders for active and history consolidated'), verifyJWT, listUserOrderHistory);

// Self delete
userRouter.delete('/delete-account', verifyJWT, deleteSelfAccount);

// Offers routes
import { getActiveOffers, getShopOffers } from '../controllers/offersController.js';
userRouter.get('/offers', verifyJWT, getActiveOffers);
userRouter.get('/shops/:shopId/offers', verifyJWT, getShopOffers);

export default userRouter;

