import { Router } from 'express';
import {
  createOrder,
  simulatePaymentSuccess,
  razorpayWebhook,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public / Customer
router.post('/', createOrder);
router.post('/simulate-success', simulatePaymentSuccess);
router.post('/webhook', razorpayWebhook);
router.get('/my-orders/:userId', getMyOrders);
router.get('/detail/:id', getOrderById);

// Admin
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), getAllOrders);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager'), updateOrderStatus);

export default router;
