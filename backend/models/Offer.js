const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['loan', 'cash'],
        required: true
    },
    closingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered'],
        default: 'pending'
    },
    counterPrice: {
        type: Number
    },
    buyerName: String,
    buyerPhone: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Offer', OfferSchema);
