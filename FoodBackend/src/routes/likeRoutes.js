import express from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
    toggleLike,
    checkLikeStatus,
    getLikes,
    getUserLikes
} from '../controllers/likeController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Toggle like
router.post('/toggle', toggleLike);

// Get user's likes for a specific target (place before param routes)
router.get('/user/:targetType/:targetId', getUserLikes);

// Check like status
router.get('/status/:targetType/:targetId', checkLikeStatus);

// Get likes for a target
router.get('/:targetType/:targetId', getLikes);

export default router;
