import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  resetUserPassword,
  updateUserRole,
  deleteUser,
  getAuditLogs,
} from '../controllers/userController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Expose admin CRM & logs endpoints
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin', 'customer_support'), getAllUsers);
router.get('/logs', authenticateJWT, authorizeRoles('super_admin', 'admin'), getAuditLogs);
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin', 'customer_support'), getUserById);
router.put('/:id/role', authenticateJWT, authorizeRoles('super_admin'), updateUserRole);
router.put('/:id/password', authenticateJWT, authorizeRoles('super_admin', 'admin'), resetUserPassword);
router.delete('/:id', authenticateJWT, authorizeRoles('super_admin'), deleteUser);

export default router;
