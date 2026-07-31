import express from 'express';
import auth from '../middleware/authmiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

import {
  getProfile,
  updateProfile,
} from '../controllers/customer/profileController.js';

import {
  getProducts,
  getProductById,
  getCategories,
} from '../controllers/customer/productController.js';

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/customer/orderController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/categories', getCategories);

router.use(auth);
router.use(authorize('customer', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post('/orders', createOrder);
router.get('/orders', getMyOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/cancel', cancelOrder);

export default router;