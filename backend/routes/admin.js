const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Offer = require('../models/Offer');

// @route   GET /api/admin/dashboard
// @desc    Get global statistics for admin
// @access  Public (in production, secure with Admin middleware)
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Users stats
    const totalUsers = await User.countDocuments();
    const buyersCount = await User.countDocuments({ userType: 'Buyer' });
    const sellersCount = await User.countDocuments({ userType: 'Owner' });
    const agentsCount = await User.countDocuments({ userType: 'Agent' });
    const buildersCount = await User.countDocuments({ userType: 'Builder' });
    const pendingUsers = await User.countDocuments({ verified: { $ne: true } });

    // Properties stats
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'available' });
    const pendingVerification = await Property.countDocuments({ isVerified: { $ne: true } });
    const reportedProperties = await Property.countDocuments({ 'reports.0': { $exists: true } });

    // Offers/Enquiries stats
    const totalOffers = await Offer.countDocuments();
    const acceptedOffers = await Offer.countDocuments({ status: 'accepted' });
    const enquiriesToday = await Offer.countDocuments({ createdAt: { $gte: today } });

    // Revenue stats (Token paid this month)
    const revenueData = await Offer.aggregate([
      { $match: { tokenPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$tokenAmount" } } }
    ]);
    const revenueThisMonth = revenueData.length > 0 ? revenueData[0].total : 0;

    // Chart Data (Last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    
    const chartAgg = await Offer.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }}
    ]);

    // Format chart data into an array of 7 days ending today
    const chartData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = chartAgg.find(item => item._id === dateStr);
      chartData.push(found ? found.count : 0);
      labels.push(days[d.getDay()]);
    }

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          buyers: buyersCount,
          sellers: sellersCount,
          agents: agentsCount,
          builders: buildersCount,
          pending: pendingUsers,
        },
        properties: {
          total: totalProperties,
          active: activeProperties,
          pendingVerification: pendingVerification,
          reported: reportedProperties,
        },
        offers: {
          total: totalOffers,
          accepted: acceptedOffers,
          enquiriesToday: enquiriesToday,
        },
        revenue: {
          thisMonth: revenueThisMonth
        },
        chartData: {
          data: chartData,
          labels: labels
        }
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users list
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reported properties
router.get('/reports', async (req, res) => {
  try {
    const properties = await Property.find({ 'reports.0': { $exists: true } })
      .populate('reports.reportedBy', 'name email')
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/properties/:id
// @desc    Admin delete property
router.delete('/properties/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Admin delete property error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/pending-properties
// @desc    Get all properties pending verification
router.get('/pending-properties', async (req, res) => {
  try {
    const properties = await Property.find({ isVerified: { $ne: true } })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Fetch pending properties error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/properties/:id/verify
// @desc    Admin verify property
router.put('/properties/:id/verify', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, message: 'Property verified successfully', property });
  } catch (error) {
    console.error('Admin verify property error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
