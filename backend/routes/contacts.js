const express = require('express');
const router = express.Router();

// In-memory store for contact requests (use a DB model in production)
const contacts = [];

// @route   POST /api/contacts
// @desc    Submit a contact / callback request
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, message, propertyId, agentName } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const contact = {
            id: Date.now().toString(),
            name: name || 'Anonymous',
            phone,
            email: email || '',
            message: message || '',
            propertyId: propertyId || null,
            agentName: agentName || '',
            createdAt: new Date().toISOString(),
        };

        contacts.push(contact);
        console.log('New contact request:', contact);

        res.status(201).json({ message: 'Contact request submitted successfully', contact });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/contacts
// @desc    Get all contact requests (admin)
// @access  Private
router.get('/', (req, res) => {
    res.json(contacts);
});

module.exports = router;
