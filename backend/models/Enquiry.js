const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
    // Type of enquiry
    type: {
        type: String,
        enum: ['callback', 'visit', 'general'],
        default: 'general'
    },

    // Buyer / sender info
    senderName:  { type: String, required: true },
    senderPhone: { type: String, required: true },
    senderEmail: { type: String, default: '' },
    message:     { type: String, default: '' },

    // Linked property & its owner
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // For visit requests
    visitDate: { type: String, default: '' },
    visitTime: { type: String, default: '' },

    // Status (owner can mark as done)
    status: {
        type: String,
        enum: ['new', 'seen', 'done'],
        default: 'new'
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
