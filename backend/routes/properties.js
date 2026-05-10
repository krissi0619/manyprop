const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      propertyType,
      priceType,
      city,
      locality,
      minPrice,
      maxPrice,
      bedrooms,
      constructionStatus,
      isVerified,
      postedBy,
      bhkTypes,
      amenities,
      search,
      featured,
      trending,
      recommended,
      owner
    } = req.query;

    // Build filter object
    const filter = {};

    if (owner) filter.owner = owner;

    if (propertyType) filter.propertyType = propertyType;
    if (priceType) filter.priceType = priceType;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (locality) filter['address.locality'] = new RegExp(locality, 'i');
    if (constructionStatus) filter.constructionStatus = new RegExp(`^${constructionStatus}$`, 'i');
    if (isVerified === 'true') filter.isVerified = true;
    if (postedBy) filter.postedBy = new RegExp(`^${postedBy}$`, 'i');
    if (bhkTypes) {
      const types = bhkTypes.split(',');
      filter.bhkTypes = { $in: types };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (bedrooms) filter['details.bedrooms'] = parseInt(bedrooms);

    // Furnished filter – accept both label and snake_case values
    const { furnished } = req.query;
    if (furnished) {
      const furnishMap = {
        'fully_furnished': 'Furnished',
        'semi_furnished': 'Semi-Furnished',
        'unfurnished': 'Unfurnished',
        'Furnished': 'Furnished',
        'Semi-Furnished': 'Semi-Furnished',
        'Unfurnished': 'Unfurnished',
      };
      const label = furnishMap[furnished] || furnished;
      const furnishedOr = [
        { 'details.furnished': label },
        { furnished: label },
      ];
      if (!filter.$and) filter.$and = [];
      filter.$and.push({ $or: furnishedOr });
    }

    // Amenities filter – amenities can be comma-separated
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenityList };
    }

    if (search) {
      const searchOr = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.locality': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') }
      ];
      if (!filter.$and) filter.$and = [];
      filter.$and.push({ $or: searchOr });
    }
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;
    if (recommended === 'true') filter.recommended = true;

    // Only filter by status if there are documents with a status field
    // (avoids blocking newly seeded data without status set)

    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/:id
// @desc    Get a single property
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'name email phone profile.avatar');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties
// @desc    Create a new property
// @access  Private (requires authentication)
router.post('/', async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.body.owner || '507f1f77bcf86cd799439011' // Placeholder owner ID
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json(property);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties/:id/report
// @desc    Report a property
// @access  Private
router.post('/:id/report', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Since we don't have auth middleware for all routes in properties.js, we expect userId in body or headers
    // Using a simple body param for now
    const { userId, reason } = req.body;
    
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    property.reports.push({
      reportedBy: userId || null, // null if anonymous or not provided
      reason,
      date: new Date()
    });

    await property.save();
    res.json({ success: true, message: 'Property reported successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;