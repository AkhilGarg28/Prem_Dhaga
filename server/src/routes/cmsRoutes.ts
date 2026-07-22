import { Router } from 'express';
import { getAllCMSContent, getCMSContentByKey, updateCMSContentByKey, bulkUpdateCMS } from '../controllers/cmsController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Publicly fetch homepage layouts, policies
router.get('/', getAllCMSContent);
router.get('/:key', getCMSContentByKey);

// Admin layout modifications
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager', 'content_editor', 'content_manager', 'super_admin'), bulkUpdateCMS);
router.put('/:key', authenticateJWT, authorizeRoles('admin', 'manager', 'content_editor', 'content_manager', 'super_admin'), updateCMSContentByKey);

export default router;
