import { Router } from 'express';
import {
  getCollections,
  createCollection,
  getProducts,
  getProductBySlug,
  createProduct,
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
  authorizeRoles('admin', 'manager'),
  upload.single('image'),
  createCollection
);

// Products
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin', 'manager'),
  upload.array('images', 5),
  createProduct
);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteProduct);

export default router;
