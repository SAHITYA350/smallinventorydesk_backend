import express from 'express';
import auth from '../middleware/authmiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/admin/categoryController.js';

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/admin/productController.js';

import {
  createBill,
  getAllBills,
  getBillById,
} from '../controllers/admin/billingController.js';

import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/admin/userController.js';

import { getDashboardStats } from '../controllers/admin/dashboardController.js';
import { updateStock, getAuditLogs } from '../controllers/admin/stockController.js';
import { exportBillingCSV, exportOrdersCSV } from '../controllers/admin/exportController.js';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../controllers/customer/orderController.js';

const router = express.Router();

// ─── All admin routes require authentication + admin role ───────────────────
router.use(auth);
router.use(authorize('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ─── Categories CRUD ──────────────────────────────────────────────────────────
router.post('/categories', createCategory);
router.get('/categories', getAllCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ─── Products CRUD ────────────────────────────────────────────────────────────
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ─── Stock Update + Audit Log ─────────────────────────────────────────────────
router.patch('/products/:id/stock', updateStock);
router.get('/audit-logs', getAuditLogs);

// ─── Billing ──────────────────────────────────────────────────────────────────
router.post('/billing', createBill);
router.get('/billing', getAllBills);
router.get('/billing/:id', getBillById);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// ─── Customer Orders (Admin view) ─────────────────────────────────────────────
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id', updateOrderStatusAdmin);

// ─── CSV Exports ──────────────────────────────────────────────────────────────
router.get('/export/billing', exportBillingCSV);
router.get('/export/orders', exportOrdersCSV);

export default router;
