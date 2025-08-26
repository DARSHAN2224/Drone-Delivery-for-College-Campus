import express from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
    addActivity,
    getUserHistory,
    getHistoryByAction,
    clearHistory,
    getActivitySummary
} from '../controllers/recentHistoryController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Add activity
router.post('/add', addActivity);

// Get user's history
router.get('/user', getUserHistory);

// Get history by action type
router.get('/action/:actionType', getHistoryByAction);

// Clear history
router.delete('/clear', clearHistory);

// Get activity summary
router.get('/summary', getActivitySummary);

export default router;
