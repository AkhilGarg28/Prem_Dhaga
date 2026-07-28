import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getFinanceReports,
  razorpayWebhook,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderCourier,
  updateOrderStatus,
  approveOrder,
  createShipment,
  generateAWB,
  dispatchOrder,
} from '../controllers/orderController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { checkoutLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public webhook and verification routes
router.post('/', checkoutLimiter, createOrder);  // checkout rate-limited
router.post('/verify-payment', verifyPayment);
router.post('/simulate-success', simulatePaymentSuccess);
router.post('/simulate-failure', simulatePaymentFailure);
router.post('/webhook', razorpayWebhook);

// Customer order routes
router.get('/my-orders', authenticateJWT, getMyOrders);
router.get('/detail/:id', getOrderById);
router.post('/:id/cancel', authenticateJWT, cancelOrder);

// Admin order routes
router.get('/finance-reports', authenticateJWT, authorizeRoles('admin', 'manager', 'finance_manager', 'super_admin'), getFinanceReports);
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), getAllOrders);
router.put('/:id/courier', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), updateOrderCourier);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), updateOrderStatus);

// Admin Order Fulfillment Workflow Routes (Admin Approval -> Create Shipment -> Generate AWB -> Dispatch)
router.post('/admin/:id/approve', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), approveOrder);
router.post('/admin/:id/create-shipment', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), createShipment);
router.post('/admin/:id/generate-awb', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), generateAWB);
router.post('/admin/:id/dispatch', authenticateJWT, authorizeRoles('admin', 'manager', 'orders_manager', 'super_admin'), dispatchOrder);

export default router;
