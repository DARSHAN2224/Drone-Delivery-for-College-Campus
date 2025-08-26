import { Router } from 'express';
const adminRouter = Router();
import { 
    loginAdmin, 
    logoutAdmin, 
    refreshAccessToken, 
    registerAdmin,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getDeviceDetails,
    viewProfile,
    loadEditProfile,
    updateEditProfile,
    getDashboardStats,
    getAdminStats,
    approveProduct,
    getPendingProducts,
    getAllProducts,
    approveShop,
    getPendingShops,
    getAllShops,
    getSellers,
    toggleSellerStatus,
    resendVerificationCode
} from '../controllers/adminController.js';
import { upload } from "../middlewares/multerMiddleware.js"
import { verifyJWT, verifyAdminJWT, checkAlreadyAuthenticated } from '../middlewares/authMiddleware.js';
import { onlyAdminAccess } from '../middlewares/adminMiddleware.js';
import { loginRateLimiter, signupRateLimiter, passwordResetRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { accountLockoutMiddleware } from '../middlewares/accountLockoutMiddleware.js';
import { 
    registerValidator,
    loginValidator,
    resetPasswordValidator,
    forgetPasswordValidator,
    updateUserValidator
} from '../utils/validator.js'
import { listPages, upsertPage, getPageById, createPage, updatePage, deletePage } from '../controllers/staticPageController.js';
import { pageCreateValidator, pageUpdateValidator } from '../utils/validator.js';
import { deleteUser, deleteSeller, toggleUserStatus, toggleSellerStatusAdmin } from '../controllers/adminUserMgmtController.js';
import { getPendingOffers, approveOffer } from '../controllers/offersController.js';
import { 
    getAllDocumentationBlocks, 
    createDocumentationBlock, 
    updateDocumentationBlock, 
    deleteDocumentationBlock, 
    reorderDocumentationBlocks, 
    toggleBlockStatus,
    bulkUpdateDocumentation
} from '../controllers/documentationController.js';

// Authentication routes - protected from already authenticated users
adminRouter.route("/register").post(checkAlreadyAuthenticated, signupRateLimiter, registerValidator, registerAdmin);
adminRouter.route("/login").post(checkAlreadyAuthenticated, loginRateLimiter, accountLockoutMiddleware, loginValidator, loginAdmin);
adminRouter.route("/logout").post(verifyAdminJWT, onlyAdminAccess, logoutAdmin);
adminRouter.route("/refresh-token").post(refreshAccessToken);
adminRouter.route('/device-info').get(getDeviceDetails);
adminRouter.route('/verify-email').post(checkAlreadyAuthenticated, verifyEmail);
adminRouter.route('/resend-verification').post(checkAlreadyAuthenticated, resendVerificationCode);
adminRouter.route('/forgot-password').post(checkAlreadyAuthenticated, passwordResetRateLimiter, forgetPasswordValidator, forgotPassword);
adminRouter.route('/reset-password/:token').post(checkAlreadyAuthenticated, resetPasswordValidator, resetPassword);

// Profile routes
adminRouter.get("/viewProfile", verifyAdminJWT, onlyAdminAccess, viewProfile)
adminRouter.get("/edit-profile", verifyAdminJWT, onlyAdminAccess, loadEditProfile)
adminRouter.post("/update-profile", verifyAdminJWT, onlyAdminAccess, upload.single('image'), updateUserValidator, updateEditProfile)

// Dashboard routes
adminRouter.get("/dashboard/stats", verifyAdminJWT, onlyAdminAccess, getDashboardStats);
adminRouter.get("/stats", verifyAdminJWT, onlyAdminAccess, getAdminStats);
// Analytics (alias path requested)
adminRouter.get("/analytics", verifyAdminJWT, onlyAdminAccess, getAdminStats);

// Product verification routes
adminRouter.get("/products/pending", verifyAdminJWT, onlyAdminAccess, getPendingProducts);
adminRouter.get("/products", verifyAdminJWT, onlyAdminAccess, getAllProducts);
adminRouter.put("/products/:productId/approve", verifyAdminJWT, onlyAdminAccess, approveProduct);

// Shop approval routes
adminRouter.get("/shops/pending", verifyAdminJWT, onlyAdminAccess, getPendingShops);
adminRouter.get("/shops", verifyAdminJWT, onlyAdminAccess, getAllShops);
adminRouter.put("/shops/:shopId/approve", verifyAdminJWT, onlyAdminAccess, approveShop);

// Offer approval routes
adminRouter.get("/offers/pending", verifyAdminJWT, onlyAdminAccess, getPendingOffers);
adminRouter.put("/offers/:offerId/approve", verifyAdminJWT, onlyAdminAccess, approveOffer);

// Seller management routes
adminRouter.get("/sellers", verifyAdminJWT, onlyAdminAccess, getSellers);
adminRouter.put("/sellers/:sellerId/status", verifyAdminJWT, onlyAdminAccess, toggleSellerStatus);
// Account management
adminRouter.delete('/users/:userId', verifyAdminJWT, onlyAdminAccess, deleteUser);
adminRouter.delete('/sellers/:sellerId', verifyAdminJWT, onlyAdminAccess, deleteSeller);
adminRouter.put('/users/:userId/status', verifyAdminJWT, onlyAdminAccess, toggleUserStatus);
adminRouter.put('/sellers/:sellerId/admin-status', verifyAdminJWT, onlyAdminAccess, toggleSellerStatusAdmin);

// Static pages (CMS) routes (REST)
adminRouter.get('/pages', verifyAdminJWT, onlyAdminAccess, listPages);
adminRouter.get('/pages/:id', verifyAdminJWT, onlyAdminAccess, getPageById);
adminRouter.post('/pages', verifyAdminJWT, onlyAdminAccess, pageCreateValidator, createPage);
adminRouter.put('/pages/:id', verifyAdminJWT, onlyAdminAccess, pageUpdateValidator, updatePage);
adminRouter.delete('/pages/:id', verifyAdminJWT, onlyAdminAccess, deletePage);

// Legacy upsert endpoints for backward compatibility
adminRouter.post('/pages-upsert', verifyAdminJWT, onlyAdminAccess, upsertPage);
adminRouter.put('/pages', verifyAdminJWT, onlyAdminAccess, upsertPage);

// Documentation management routes
adminRouter.get('/documentation', verifyAdminJWT, onlyAdminAccess, getAllDocumentationBlocks);
adminRouter.post('/documentation', verifyAdminJWT, onlyAdminAccess, createDocumentationBlock);
adminRouter.put('/documentation/:blockId', verifyAdminJWT, onlyAdminAccess, updateDocumentationBlock);
adminRouter.delete('/documentation/:blockId', verifyAdminJWT, onlyAdminAccess, deleteDocumentationBlock);
adminRouter.put('/documentation/reorder', verifyAdminJWT, onlyAdminAccess, reorderDocumentationBlocks);
adminRouter.put('/documentation/:blockId/toggle', verifyAdminJWT, onlyAdminAccess, toggleBlockStatus);
adminRouter.put('/documentation/bulk-update', verifyAdminJWT, onlyAdminAccess, bulkUpdateDocumentation);

export default adminRouter;

