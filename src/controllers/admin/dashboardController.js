import Product from '../../models/product.js';
import Category from '../../models/category.js';
import Order from '../../models/order.js';
import Billing from '../../models/billing.js';
import User from '../../models/user.js';

/**
 * GET /api/admin/dashboard
 * Returns full dashboard stats including low-stock alerts and sales trends.
 */
export const getDashboardStats = async (req, res) => {
  try {
    // --- Core Counts ---
    const [totalProducts, totalCategories, totalCustomers, totalOrders, totalBills] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Billing.countDocuments(),
    ]);

    // --- Revenue from Billing ---
    const billingRevenueResult = await Billing.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } },
    ]);
    const totalBillingRevenue = billingRevenueResult[0]?.totalRevenue || 0;

    // --- Revenue from Orders (paid) ---
    const orderRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalOrderRevenue = orderRevenueResult[0]?.totalRevenue || 0;

    // --- Low Stock Products (uses each product's own lowStockThreshold) ---
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
      .populate('category', 'categoryName')
      .select('name stock lowStockThreshold sku price category');

    // --- Out of Stock ---
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    // --- Sales Trend: last 7 days (from Billing, grouped by day) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await Billing.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalRevenue: { $sum: '$grandTotal' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day',
                },
              },
            },
          },
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
    ]);

    // --- Top 5 selling products (from Billing items) ---
    const topProducts = await Billing.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.amount' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalCustomers,
        totalOrders,
        totalBills,
        totalBillingRevenue: Math.round((totalBillingRevenue || 0) * 100) / 100,
        totalOrderRevenue: Math.round((totalOrderRevenue || 0) * 100) / 100,
        totalCombinedRevenue: Math.round(((totalBillingRevenue || 0) + (totalOrderRevenue || 0)) * 100) / 100,
        outOfStockCount,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        salesTrend,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
