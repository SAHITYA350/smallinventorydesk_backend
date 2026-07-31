import Billing from '../../models/billing.js';
import Product from '../../models/product.js';

export const createBill = async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, items, taxPercent = 0, discount = 0, paymentMethod = 'cash' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array cannot be empty' });
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found for ID: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}` });
      }

      const itemAmount = product.price * item.quantity;
      subtotal += itemAmount;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        amount: itemAmount,
      });

      // Deduct product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);
    const invoiceNumber = `INV-${Date.now()}`;

    const bill = await Billing.create({
      invoiceNumber,
      customer: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      items: processedItems,
      subtotal,
      tax: taxAmount,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus: 'paid',
      billedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Bill generated successfully', bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('customer', 'name email phoneNumber')
      .populate('billedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id)
      .populate('customer', 'name email phoneNumber')
      .populate('billedBy', 'name email');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
