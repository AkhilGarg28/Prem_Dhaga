import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeRoles('admin', 'manager'), getDashboardStats);

export default router;
