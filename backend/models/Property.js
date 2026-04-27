const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  propertyType: {
    type: String,
    enum: ['flat', 'apartment', 'villa', 'farm', 'independent_house', 'luxury_bungalow', 'pg', 'plot', 'commercial', 'project'],
    required: true
  },
  constructionStatus: {
    type: String,
    enum: ['Under Construction', 'Ready To Move', 'New Launch'],
    default: 'Ready To Move'
  },
  postedBy: {
    type: String,
    enum: ['Owner', 'Dealer', 'Builder'],
    default: 'Owner'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  bhkTypes: [String], // e.g., ["2 BHK", "4 BHK", "5 BHK"]
  address: {
    street: String,
    city: String,
    locality: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  details: {
    bedrooms: Number,
    bathrooms: Number,
    otherRooms: [String],
    area: Number,
    carpetArea: Number,
    builtUpArea: Number,
    areaUnit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft'
    },
    furnished: {
      type: String,
      enum: ['fully_furnished', 'semi_furnished', 'unfurnished'],
      default: 'unfurnished'
    },
    parking: String,
    floor: String,
    totalFloors: Number,
    propertyAge: String,
    facingDirection: String,
    expectedPrice: Number,
    pricePerSqft: Number,
    isNegotiable: Boolean,
    brokerageType: String,
    brokerageAmount: String,
    status: String,
    additionalFeatures: String
  },
  amenities: [String],
  images: [String],
  video: String,
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  recommended: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented'],
    default: 'available'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentContact: {
    name: String,
    phone: String,
    email: String,
    company: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PropertySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', PropertySchema);