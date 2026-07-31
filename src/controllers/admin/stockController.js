import Product from '../../models/product.js';
import StockAuditLog from '../../models/stockAuditLog.js';

/**
 * PATCH /api/admin/products/:id/stock
 * Update stock quantity for a product and record an audit log entry.
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { newQuantity, reason } = req.body;

    if (newQuantity === undefined || newQuantity === null) {
      return res.status(400).json({ success: false, message: 'newQuantity is required' });
    }

    const qty = Number(newQuantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'newQuantity must be a non-negative number' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldQuantity = product.stock;
    product.stock = qty;
    await product.save();

    // Create audit log
    const auditLog = await StockAuditLog.create({
      product: product._id,
      oldQuantity,
      newQuantity: qty,
      updatedBy: req.user.id,
      reason: reason || 'Manual update',
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      product: { _id: product._id, name: product.name, stock: product.stock, lowStockThreshold: product.lowStockThreshold },
      auditLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/audit-logs
 * Get all stock audit logs, optionally filtered by product.
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { productId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (productId) query.product = productId;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      StockAuditLog.find(query)
        .populate('product', 'name sku')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockAuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
