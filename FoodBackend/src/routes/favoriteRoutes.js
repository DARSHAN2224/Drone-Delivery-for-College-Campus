import express from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
    toggleFavorite,
    checkFavoriteStatus,
    getFavorites,
    getUserFavorites
} from '../controllers/favoriteController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Toggle favorite
router.post('/toggle', toggleFavorite);

// Get user's favorites for a specific target (place before param routes)
router.get('/user/:targetType/:targetId', getUserFavorites);

// Check favorite status
router.get('/status/:targetType/:targetId', checkFavoriteStatus);

// Get favorites for a target
router.get('/:targetType/:targetId', getFavorites);

export default router;
