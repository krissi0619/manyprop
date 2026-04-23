const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  userType: {
    type: String,
    enum: ['Buyer', 'Tenant', 'Owner', 'Builder', 'Agent', 'Landlord', 'Buyer / Tenant'],
    default: 'Buyer'
  },
  isAgent: {
    type: Boolean,
    default: false
  },
  occupation: {
    type: String,
    trim: true,
    default: ''
  },
  annualIncome: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  profile: {
    avatar: String,
    bio: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  preferences: {
    propertyType: [String],
    priceRange: { min: Number, max: Number },
    locations: [String],
    budget: String,
    configuration: String,
    furnishingStatus: String,
    occupancyType: String,
    keyAmenities: String,
    moveInTimeline: String
  },
  // Agent / Broker professional info
  agentDetails: {
    reraRegistration: String,
    companyName: String,
    operatingLocalities: String,
    reraAgentLicense: String,
    gstNumber: String,
  },
  // Developer / Builder company info
  developerDetails: {
    entityType: String,
    companyUrl: String,
    cin: String,
    reraRegistration: String,
  },
  // KYC verification
  kyc: {
    aadhaarNumber: String,
    panNumber: String,
    updatedAt: Date,
  },
  verified: {
    type: Boolean,
    default: false
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

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);