import Order from '../../models/order.js';
import Product from '../../models/product.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'online', liveLocation } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items array cannot be empty' });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.isAvailable === false) {
        return res.status(404).json({ success: false, message: `Product unavailable or not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Insufficient stock for '${product.name}'. Available: ${product.stock}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const normalizedPaymentMethod = (paymentMethod || 'razorpay').toString().trim().toLowerCase();

    const order = await Order.create({
      customer: req.user.id,
      items: processedItems,
      totalAmount,
      shippingAddress: shippingAddress || 'Default Address',
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      liveLocation: liveLocation || null,
    });

    // Emit Socket.io Real-Time Event to Admin
    if (req.io) {
      req.io.emit('new_order', {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        customerName: req.user.name || 'Customer',
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        liveLocation: order.liveLocation,
        itemsCount: processedItems.length,
        createdAt: order.createdAt,
      });

      req.io.emit('stock_updated', { items: processedItems });
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product', 'name price imageUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer: req.user.id }).populate('items.product', 'name price imageUrl');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: `Cannot cancel order in '${order.orderStatus}' status` });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    if (req.io) {
      req.io.emit('order_status_updated', { orderId: order._id, orderStatus: 'cancelled' });
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Order Management controllers
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phoneNumber')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(id, updates, { returnDocument: 'after' }).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.io) {
      req.io.emit('order_status_updated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
      });
    }

    res.json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
