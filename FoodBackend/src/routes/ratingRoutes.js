import express from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
    addRating,
    getRatings,
    getUserRatings,
    deleteRating
} from '../controllers/ratingController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(verifyJWT);

// Add or update rating
router.post('/add', addRating);

// Get user's ratings for a specific target (place before param routes)
router.get('/user/:targetType/:targetId', getUserRatings);

// Get ratings for a target
router.get('/:targetType/:targetId', getRatings);

// Delete rating by id
router.delete('/:ratingId', deleteRating);

export default router;
