import Billing from '../../models/billing.js';
import Order from '../../models/order.js';


function toCSV(rows, headers) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };
  const headerLine = headers.map((h) => escape(h.label)).join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => escape(h.value(row))).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}


export const exportBillingCSV = async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate('customer', 'name email phoneNumber')
      .populate('billedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      { label: 'Invoice Number', value: (r) => r.invoiceNumber },
      { label: 'Date', value: (r) => new Date(r.createdAt).toLocaleDateString() },
      { label: 'Customer Name', value: (r) => r.customerName || r.customer?.name || 'Walk-in Customer' },
      { label: 'Customer Phone', value: (r) => r.customerPhone || r.customer?.phoneNumber || '' },
      { label: 'Subtotal', value: (r) => r.subtotal },
      { label: 'Tax', value: (r) => r.tax },
      { label: 'Discount', value: (r) => r.discount },
      { label: 'Grand Total', value: (r) => r.grandTotal },
      { label: 'Payment Method', value: (r) => r.paymentMethod },
      { label: 'Payment Status', value: (r) => r.paymentStatus },
      { label: 'Billed By', value: (r) => r.billedBy?.name || '' },
      { label: 'Items', value: (r) => r.items.map((i) => `${i.name} x${i.quantity}`).join('; ') },
    ];

    const csv = toCSV(bills, headers);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="billing-export-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      { label: 'Order ID', value: (r) => r._id },
      { label: 'Date', value: (r) => new Date(r.createdAt).toLocaleDateString() },
      { label: 'Customer Name', value: (r) => r.customer?.name || '' },
      { label: 'Customer Email', value: (r) => r.customer?.email || '' },
      { label: 'Total Amount', value: (r) => r.totalAmount },
      { label: 'Payment Method', value: (r) => r.paymentMethod },
      { label: 'Payment Status', value: (r) => r.paymentStatus },
      { label: 'Order Status', value: (r) => r.orderStatus },
      { label: 'Shipping Address', value: (r) => r.shippingAddress },
      { label: 'Items', value: (r) => r.items.map((i) => `${i.name} x${i.quantity}`).join('; ') },
    ];

    const csv = toCSV(orders, headers);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-export-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
