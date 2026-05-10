const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['buyer', 'seller'], required: true },
    text:   { type: String, required: true },
    time:   { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
    type:   { type: String },   // 'aadhaar', 'pan', 'property_docs'
    url:    { type: String },
    status: { type: String, enum: ['pending', 'uploaded', 'verified'], default: 'pending' }
});

const OfferSchema = new mongoose.Schema({
    buyer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },

    // ── Buyer snapshot (for display without populate) ──────────────────
    buyerName:  { type: String },
    buyerPhone: { type: String },
    buyerEmail: { type: String },

    // ── Step 1 – Site visit ────────────────────────────────────────────
    visitDate:     { type: String },   // e.g. "2026-05-04"
    visitTime:     { type: String },   // e.g. "10:00 AM"
    visitStatus:   { type: String, enum: ['none', 'scheduled', 'completed'], default: 'none' },

    // ── Step 3 – Offer ────────────────────────────────────────────────
    offerPrice:   { type: Number, required: true },
    paymentType:  { type: String, enum: ['loan', 'cash', 'other'], default: 'cash' },
    closingDate:  { type: Date },
    messageToOwner: { type: String },

    // ── Step 2 – Chat ─────────────────────────────────────────────────
    messages: [MessageSchema],

    // ── Status ────────────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered', 'token_paid', 'deal_done'],
        default: 'pending'
    },
    counterPrice: { type: Number },
    agreedPrice:  { type: Number },

    // ── Step 4 – Secure the deal ──────────────────────────────────────
    tokenPaid: { type: Boolean, default: false },
    tokenAmount: { type: Number, default: 50000 },
    documents: [DocumentSchema],

    // ── Step 5 – Deal confirmation ────────────────────────────────────
    dealConfirmedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

OfferSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Offer', OfferSchema);
