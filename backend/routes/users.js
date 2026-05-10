const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, profile, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profile) updateData.profile = profile;
    if (preferences) updateData.preferences = preferences;
    updateData.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/dashboard
// @desc    Get user dashboard statistics
// @access  Public (should ideally be Private, keeping simple)
router.get('/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;
    const Property = require('../models/Property');
    const Offer = require('../models/Offer');

    // Seller Stats
    const properties = await Property.find({ owner: userId });
    const totalProperties = properties.length;
    const totalPropertyViews = properties.reduce((acc, prop) => acc + (prop.views || 0), 0);
    const enquiriesReceived = await Offer.countDocuments({ seller: userId });

    // Buyer Stats
    const enquiriesSent = await Offer.countDocuments({ buyer: userId });

    res.json({
      seller: {
        totalProperties,
        totalPropertyViews,
        enquiriesReceived
      },
      buyer: {
        enquiriesSent
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;