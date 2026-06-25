import { Router } from 'express';
import {
  createCustomOrder,
  getCustomOrderById,
  getAllCustomOrders,
  updateCustomOrder,
} from '../controllers/customController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public / Customer
router.post('/', upload.array('sketches', 3), createCustomOrder);
router.get('/detail/:id', getCustomOrderById);

// Admin
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), getAllCustomOrders);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateCustomOrder);

export default router;
