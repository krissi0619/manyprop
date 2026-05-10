const express = require('express');
const router  = express.Router();
const Offer    = require('../models/Offer');
const Property = require('../models/Property');

// ──────────────────────────────────────────────────────────────
// Helper – populate a single offer fully
// ──────────────────────────────────────────────────────────────
const fullOffer = (q) =>
    q.populate('buyer',    'name email phone profile')
     .populate('seller',   'name email phone profile')
     .populate('property', 'title address price images agentContact owner');

// ══════════════════════════════════════════════════════════════
// POST /api/offers
// Create an offer (Step 3 → send offer)
// ══════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {
    try {
        const {
            buyer, propertyId, offerPrice, paymentType, closingDate,
            buyerName, buyerPhone, buyerEmail, messageToOwner,
            visitDate, visitTime
        } = req.body;

        if (!propertyId || !offerPrice) {
            return res.status(400).json({ message: 'propertyId and offerPrice are required' });
        }

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found' });

        // Allow offer even for mock IDs (no valid ObjectId)
        const sellerRef = property.owner || undefined;

        const offer = new Offer({
            buyer:    buyer   || undefined,
            seller:   sellerRef,
            property: propertyId,
            offerPrice,
            paymentType: paymentType || 'cash',
            closingDate:  closingDate ? new Date(closingDate) : undefined,
            buyerName, buyerPhone, buyerEmail,
            messageToOwner,
            visitDate, visitTime,
            visitStatus: visitDate ? 'scheduled' : 'none',
            // Seed first buyer chat message
            messages: messageToOwner
                ? [{ sender: 'buyer', text: messageToOwner }]
                : []
        });

        await offer.save();
        const saved = await fullOffer(Offer.findById(offer._id));
        res.status(201).json(saved);
    } catch (err) {
        console.error('POST /api/offers', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════
// GET /api/offers/:id
// Get a single offer (full details for the 5-step UI)
// ══════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
    try {
        const offer = await fullOffer(Offer.findById(req.params.id));
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        res.json(offer);
    } catch (err) {
        console.error('GET /api/offers/:id', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// GET /api/offers/property/:propertyId
// ══════════════════════════════════════════════════════════════
router.get('/property/:propertyId', async (req, res) => {
    try {
        const offers = await fullOffer(
            Offer.find({ property: req.params.propertyId }).sort({ createdAt: -1 })
        );
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// GET /api/offers/buyer/:buyerId
// ══════════════════════════════════════════════════════════════
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const offers = await fullOffer(
            Offer.find({ buyer: req.params.buyerId }).sort({ createdAt: -1 })
        );
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// GET /api/offers/seller/:sellerId
// ══════════════════════════════════════════════════════════════
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const offers = await fullOffer(
            Offer.find({ seller: req.params.sellerId }).sort({ createdAt: -1 })
        );
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/offers/:id/visit
// Step 1 – Schedule / confirm visit
// ══════════════════════════════════════════════════════════════
router.put('/:id/visit', async (req, res) => {
    try {
        const { visitDate, visitTime, visitStatus } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        if (visitDate)   offer.visitDate   = visitDate;
        if (visitTime)   offer.visitTime   = visitTime;
        if (visitStatus) offer.visitStatus = visitStatus;

        await offer.save();
        res.json(offer);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// POST /api/offers/:id/message
// Step 2 – Send a chat message
// ══════════════════════════════════════════════════════════════
router.post('/:id/message', async (req, res) => {
    try {
        const { sender, text } = req.body;
        if (!sender || !text) return res.status(400).json({ message: 'sender and text required' });

        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.messages.push({ sender, text });
        await offer.save();
        res.json(offer.messages[offer.messages.length - 1]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/offers/:id/status
// Accept / reject / counter offer (Step 3→4)
// ══════════════════════════════════════════════════════════════
router.put('/:id/status', async (req, res) => {
    try {
        const { status, counterPrice, agreedPrice } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.status = status;
        if (counterPrice) offer.counterPrice = counterPrice;
        if (agreedPrice)  offer.agreedPrice  = agreedPrice;
        if (status === 'deal_done') offer.dealConfirmedAt = new Date();

        await offer.save();
        res.json(offer);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// POST /api/offers/:id/token
// Step 4 – Mark token as paid
// ══════════════════════════════════════════════════════════════
router.post('/:id/token', async (req, res) => {
    try {
        const { tokenAmount } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.tokenPaid   = true;
        offer.tokenAmount = tokenAmount || 50000;
        offer.status      = 'token_paid';
        await offer.save();
        res.json({ success: true, offer });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/offers/:id/documents
// Step 4 – Upload / update document status
// ══════════════════════════════════════════════════════════════
router.put('/:id/documents', async (req, res) => {
    try {
        const { docType, url, status } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        const existing = offer.documents.find(d => d.type === docType);
        if (existing) {
            existing.url    = url    || existing.url;
            existing.status = status || 'uploaded';
        } else {
            offer.documents.push({ type: docType, url, status: status || 'uploaded' });
        }

        await offer.save();
        res.json(offer.documents);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ══════════════════════════════════════════════════════════════
// POST /api/offers/:id/confirm-deal
// Step 5 – Final deal confirmation
// ══════════════════════════════════════════════════════════════
router.post('/:id/confirm-deal', async (req, res) => {
    try {
        const { agreedPrice } = req.body;
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        offer.status          = 'deal_done';
        offer.dealConfirmedAt = new Date();
        if (agreedPrice) offer.agreedPrice = agreedPrice;

        await offer.save();
        const updated = await fullOffer(Offer.findById(offer._id));
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
