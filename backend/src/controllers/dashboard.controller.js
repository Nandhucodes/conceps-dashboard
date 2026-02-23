const User = require('../models/User');
const Product = require('../models/Product');
const Registration = require('../models/Registration');
const { sendSuccess } = require('../utils/response.utils');

// ─── GET /api/dashboard/metrics ──────────────────────────────────────────────
/**
 * Aggregates all summary metrics shown on the dashboard home page.
 * Runs queries in parallel with Promise.all to keep latency low.
 */
const getMetrics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalRegistrations,
      revenue,
      registrationsByStatus,
      recentRegistrations,
    ] = await Promise.all([
      User.count(),
      Product.count(),
      Registration.count(),
      Product.totalRevenue(),
      Registration.countByStatus(),
      Registration.recent(5),
    ]);

    // Flatten status counts into a key-value map
    const registrationStats = registrationsByStatus.reduce((acc, row) => {
      acc[row.status] = row.total;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    return sendSuccess(res, {
      metrics: {
        totalUsers,
        totalProducts,
        totalRegistrations,
        totalRevenue: parseFloat(revenue),
      },
      registrationStats,
      recentRegistrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMetrics };
