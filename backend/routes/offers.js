const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Property = require('../models/Property');

// @route   POST /api/offers
// @desc    Create a new offer
router.post('/', async (req, res) => {
    try {
        const { buyer, propertyId, offerPrice, paymentType, closingDate, buyerName, buyerPhone } = req.body;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const newOffer = new Offer({
            buyer,
            seller: property.owner, // Assuming property has an owner field
            property: propertyId,
            offerPrice,
            paymentType,
            closingDate,
            buyerName,
            buyerPhone
        });

        const offer = await newOffer.save();
        res.json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/offers/property/:propertyId
// @desc    Get offers for a property
router.get('/property/:propertyId', async (req, res) => {
    try {
        const offers = await Offer.find({ property: req.params.propertyId })
            .populate('buyer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/offers/buyer/:buyerId
// @desc    Get offers made by a buyer
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const offers = await Offer.find({ buyer: req.params.buyerId })
            .populate('property', 'title address images')
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/offers/seller/:sellerId
// @desc    Get offers received by a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const offers = await Offer.find({ seller: req.params.sellerId })
            .populate('property', 'title address images')
            .populate('buyer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/offers/:id/status
// @desc    Update offer status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, counterPrice } = req.body;
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        offer.status = status;
        if (counterPrice) {
            offer.counterPrice = counterPrice;
        }

        await offer.save();
        res.json(offer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
