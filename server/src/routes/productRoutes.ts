import { Router } from 'express';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Collections
router.get('/collections', getCollections);
router.post(
  '/collections',
  authenticateJWT,
  authorizeRoles('admin', 'manager', 'product_manager', 'super_admin'),
  upload.single('image'),
  createCollection
);
router.put(
  '/collections/:id',
  authenticateJWT,
  authorizeRoles('admin', 'manager', 'product_manager', 'super_admin'),
  updateCollection
);
router.delete(
  '/collections/:id',
  authenticateJWT,
  authorizeRoles('admin', 'super_admin'),
  deleteCollection
);

// Products
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'manager', 'product_manager', 'super_admin'),
  upload.array('images', 5),
  createProduct
);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'product_manager', 'super_admin'), updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'super_admin'), deleteProduct);

export default router;
