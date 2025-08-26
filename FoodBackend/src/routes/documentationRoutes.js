import { Router } from 'express';
import { 
    getDocumentation,
    getAllDocumentationBlocks,
    createDocumentationBlock,
    updateDocumentationBlock,
    deleteDocumentationBlock,
    reorderDocumentationBlocks,
    toggleBlockStatus
} from '../controllers/documentationController.js';
import { verifyAdminJWT } from '../middlewares/authMiddleware.js';
import { onlyAdminAccess } from '../middlewares/adminMiddleware.js';

const documentationRouter = Router();

// Public routes
documentationRouter.get('/', getDocumentation);

// Admin routes (protected)
documentationRouter.get('/admin', verifyAdminJWT, onlyAdminAccess, getAllDocumentationBlocks);
documentationRouter.post('/admin', verifyAdminJWT, onlyAdminAccess, createDocumentationBlock);
documentationRouter.put('/admin/:blockId', verifyAdminJWT, onlyAdminAccess, updateDocumentationBlock);
documentationRouter.delete('/admin/:blockId', verifyAdminJWT, onlyAdminAccess, deleteDocumentationBlock);
documentationRouter.put('/admin/reorder', verifyAdminJWT, onlyAdminAccess, reorderDocumentationBlocks);
documentationRouter.put('/admin/:blockId/toggle', verifyAdminJWT, onlyAdminAccess, toggleBlockStatus);

export default documentationRouter;
