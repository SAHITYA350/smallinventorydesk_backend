import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/customer/paymentController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;
