const express = require('express');
const router  = express.Router();
const Enquiry  = require('../models/Enquiry');
const Property = require('../models/Property');

// @route   POST /api/enquiries
// @desc    Submit a callback / visit request from property details page
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { senderName, senderPhone, senderEmail, message, propertyId, type, visitDate, visitTime } = req.body;

        if (!senderPhone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Resolve the property owner so we can attach it
        let ownerId = null;
        if (propertyId) {
            const prop = await Property.findById(propertyId).select('owner');
            if (prop) ownerId = prop.owner;
        }

        const enquiry = await Enquiry.create({
            type: type || 'callback',
            senderName:  senderName  || 'Anonymous',
            senderPhone,
            senderEmail: senderEmail || '',
            message:     message     || '',
            property:    propertyId  || null,
            owner:       ownerId,
            visitDate:   visitDate   || '',
            visitTime:   visitTime   || '',
        });

        res.status(201).json({ success: true, enquiry });
    } catch (error) {
        console.error('Enquiry create error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/enquiries/owner/:ownerId
// @desc    Get all enquiries received for a property owner / agent
// @access  Private (owner only — no middleware for now, add later)
router.get('/owner/:ownerId', async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ owner: req.params.ownerId })
            .populate('property', 'title address images')
            .sort({ createdAt: -1 });
        res.json({ success: true, enquiries });
    } catch (error) {
        console.error('Fetch owner enquiries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/enquiries/sender/:phone
// @desc    Get enquiries sent by a buyer (matched by phone)
// @access  Public
router.get('/sender/:phone', async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ senderPhone: req.params.phone })
            .populate('property', 'title address images')
            .sort({ createdAt: -1 });
        res.json({ success: true, enquiries });
    } catch (error) {
        console.error('Fetch sender enquiries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/enquiries/:id/status
// @desc    Owner marks enquiry as seen or done
// @access  Private
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json({ success: true, enquiry });
    } catch (error) {
        console.error('Update enquiry status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/enquiries/:id
// @desc    Delete an enquiry (chat)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        console.error('Delete enquiry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
