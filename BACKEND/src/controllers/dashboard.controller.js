const User = require('../models/user.model');
const Product = require('../models/product.model');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      activeProducts,
      recentUsers,
      recentProducts,
      usersByRole,
      productsByCategory,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role status createdAt'),
      Product.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name'),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalProducts,
          activeProducts,
          inactiveProducts: totalProducts - activeProducts,
        },
        recentUsers,
        recentProducts,
        charts: {
          usersByRole,
          productsByCategory,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats };
