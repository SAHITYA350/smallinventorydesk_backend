import razorpayInstance from '../../services/razorpayService.js';
import { verifyRazorpaySignature } from '../../utils/verifySignature.js';
import Order from '../../models/order.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { dbOrderId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${dbOrderId ? dbOrderId.slice(-8) : Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (dbOrderId) {
      await Order.findByIdAndUpdate(dbOrderId, { razorpayOrderId: razorpayOrder.id });
    }

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid Razorpay payment signature' });
    }

    const order = await Order.findByIdAndUpdate(
      dbOrderId,
      {
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { returnDocument: 'after' }
    ).populate('customer', 'name email phoneNumber');

    // Emit Socket.io Real-Time Notification
    const io = req.app.get('io');
    if (io) {
      io.emit('payment_success', {
        orderId: dbOrderId,
        customerName: order.customer?.name || 'Customer',
        totalAmount: order.totalAmount,
        paymentId: razorpay_payment_id,
      });

      io.emit('order_status_updated', {
        orderId: dbOrderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      });
    }

    res.json({
      success: true,
      message: 'Payment verified & order confirmed successfully!',
      order,
    });
  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
