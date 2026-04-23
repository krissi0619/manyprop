const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map();

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number (simulated)
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, name, email, userType, isAgent } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be exactly 10 digits' });
    }

    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      name: name || null,
      email: email || null,
      userType: userType || 'Buyer',
      isAgent: isAgent || false
    });

    console.log(`[OTP] Sent to +91${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove devOTP in production — only for development/testing
      devOTP: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, email, userType, isAgent } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      return res.status(400).json({ message: 'OTP expired or not sent. Please click "Send OTP" again.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'OTP has expired (10 min limit). Please request a new one.' });
    }

    if (stored.attempts >= 5) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'Too many wrong attempts. Please request a new OTP.' });
    }

    if (stored.otp !== otp.toString()) {
      stored.attempts += 1;
      const remaining = 5 - stored.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remaining} attempt(s) remaining.`
      });
    }

    // OTP verified — gather user data
    const resolvedName = name || stored.name;
    const resolvedEmail = email || stored.email;
    const resolvedUserType = userType || stored.userType || 'Buyer';
    const resolvedIsAgent = isAgent !== undefined ? isAgent : stored.isAgent;

    otpStore.delete(phone);

    let isNewUser = false;

    // Find existing user by phone
    let user = await User.findOne({ phone });

    if (!user) {
      // Try to find by email if provided
      if (resolvedEmail) {
        user = await User.findOne({ email: resolvedEmail.toLowerCase() });
        if (user) {
          user.phone = phone;
          user.verified = true;
          if (!user.userType) user.userType = resolvedUserType;
          if (resolvedIsAgent) {
            user.isAgent = true;
            user.role = 'agent';
          }
          await user.save();
        }
      }

      // Still no user — create new one
      if (!user) {
        isNewUser = true;
        const randomPassword = require('crypto').randomBytes(16).toString('hex');
        const fallbackEmail = resolvedEmail || `${phone}.${Date.now()}@manyprop.phone`;

        try {
          user = new User({
            name: resolvedName || `User_${phone.slice(-4)}`,
            email: fallbackEmail.toLowerCase(),
            password: randomPassword,
            phone,
            isAgent: resolvedIsAgent,
            role: resolvedIsAgent ? 'agent' : 'user',
            userType: resolvedUserType,
            verified: true,
            profileComplete: false
          });
          await user.save();
        } catch (saveErr) {
          if (saveErr.code === 11000) {
            user = await User.findOne({ phone });
            if (!user) {
              return res.status(500).json({ message: 'Account creation failed. Please try again.' });
            }
          } else {
            throw saveErr;
          }
        }
      }
    } else {
      // Existing phone user — update verified status
      if (!user.verified) {
        user.verified = true;
        await user.save();
      }
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
        isAgent: user.isAgent,
        profileComplete: user.profileComplete,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: 'OTP verification failed. Please try again.' });
  }
});

// @route   PUT /api/auth/complete-profile
// @desc    Complete user profile after OTP registration
// @access  Private (requires Bearer token)
router.put('/complete-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { userType, occupation, annualIncome, location, avatar } = req.body;

    const updateData = {
      profileComplete: true,
      updatedAt: Date.now()
    };

    if (userType) updateData.userType = userType;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (annualIncome !== undefined) updateData.annualIncome = annualIncome;
    if (location !== undefined) updateData.location = location;
    if (avatar) updateData['profile.avatar'] = avatar;

    const user = await User.findByIdAndUpdate(
      decoded.user.id,
      updateData,
      { new: true, runValidators: false }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
        isAgent: user.isAgent,
        occupation: user.occupation,
        annualIncome: user.annualIncome,
        location: user.location,
        profileComplete: user.profileComplete,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile. Please try again.' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user with email/password
// @access  Public
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, role, userType, isAgent } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
      isAgent: isAgent || false,
      role: isAgent ? 'agent' : (role || 'user'),
      userType: userType || 'Buyer'
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType,
            profile: user.profile
          }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email/password
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            userType: user.userType,
            profile: user.profile
          }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/save-preferences
// @desc    Save buyer/tenant search preferences after registration
// @access  Private (requires Bearer token)
router.put('/save-preferences', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const {
      propertyTypes, location, budget,
      configuration, furnishingStatus, occupancyType,
      keyAmenities, moveInTimeline
    } = req.body;

    const updateData = {
      updatedAt: Date.now(),
      'preferences.propertyType': propertyTypes || [],
      'preferences.locations': location ? [location] : [],
    };

    // Store extra preference fields in a flexible way
    if (budget)           updateData['preferences.budget']           = budget;
    if (configuration)    updateData['preferences.configuration']    = configuration;
    if (furnishingStatus) updateData['preferences.furnishingStatus'] = furnishingStatus;
    if (occupancyType)    updateData['preferences.occupancyType']    = occupancyType;
    if (keyAmenities)     updateData['preferences.keyAmenities']     = keyAmenities;
    if (moveInTimeline)   updateData['preferences.moveInTimeline']   = moveInTimeline;

    await User.findByIdAndUpdate(
      decoded.user.id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    res.json({ success: true, message: 'Preferences saved' });
  } catch (error) {
    console.error('Save preferences error:', error.message);
    res.status(500).json({ message: 'Failed to save preferences' });
  }
});

// @route   PUT /api/auth/save-agent-details
// @desc    Save agent/broker professional details
router.put('/save-agent-details', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { reraRegistration, companyName, operatingLocalities, reraAgentLicense, gstNumber } = req.body;

    await User.findByIdAndUpdate(decoded.user.id, {
      $set: {
        'agentDetails.reraRegistration': reraRegistration,
        'agentDetails.companyName': companyName,
        'agentDetails.operatingLocalities': operatingLocalities,
        'agentDetails.reraAgentLicense': reraAgentLicense,
        'agentDetails.gstNumber': gstNumber,
        updatedAt: Date.now(),
      }
    }, { runValidators: false });

    res.json({ success: true, message: 'Agent details saved' });
  } catch (error) {
    console.error('Save agent details error:', error.message);
    res.status(500).json({ message: 'Failed to save agent details' });
  }
});

// @route   PUT /api/auth/save-developer-details
// @desc    Save developer/builder company details
router.put('/save-developer-details', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { entityType, companyUrl, cin, reraRegistration } = req.body;

    await User.findByIdAndUpdate(decoded.user.id, {
      $set: {
        'developerDetails.entityType': entityType,
        'developerDetails.companyUrl': companyUrl,
        'developerDetails.cin': cin,
        'developerDetails.reraRegistration': reraRegistration,
        updatedAt: Date.now(),
      }
    }, { runValidators: false });

    res.json({ success: true, message: 'Developer details saved' });
  } catch (error) {
    console.error('Save developer details error:', error.message);
    res.status(500).json({ message: 'Failed to save developer details' });
  }
});

// @route   PUT /api/auth/save-kyc
// @desc    Save KYC (aadhaar + pan) details
router.put('/save-kyc', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { aadhaarNumber, panNumber } = req.body;

    await User.findByIdAndUpdate(decoded.user.id, {
      $set: {
        'kyc.aadhaarNumber': aadhaarNumber || '',
        'kyc.panNumber': panNumber || '',
        'kyc.updatedAt': Date.now(),
        updatedAt: Date.now(),
      }
    }, { runValidators: false });

    res.json({ success: true, message: 'KYC data saved' });
  } catch (error) {
    console.error('Save KYC error:', error.message);
    res.status(500).json({ message: 'Failed to save KYC data' });
  }
});

// @route   GET /api/auth/me
// @desc    Get full user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-document
// @desc    Mock third-party API verification for Aadhaar/PAN
router.post('/verify-document', async (req, res) => {
  try {
    const { docType, documentNumber } = req.body;
    // Simulate third party API call
    console.log(`[Third-Party Mock] Verifying ${docType} : ${documentNumber}...`);
    await new Promise(r => setTimeout(r, 800));
    
    let isValid = false;
    let message = '';

    if (docType === 'aadhaar') {
      const aadhaarRegex = /^\d{12}$/;
      isValid = aadhaarRegex.test(documentNumber);
      message = isValid ? 'Aadhaar Verified Successfully via Surepass API' : 'Invalid Aadhaar Format. Expected 12 digits.';
    } else if (docType === 'pan') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      isValid = panRegex.test(documentNumber.toUpperCase());
      message = isValid ? 'PAN Verified Successfully via NSDL API' : 'Invalid PAN Format. Expected ABCDE1234F.';
    }

    res.json({ success: isValid, message });
  } catch (error) {
    res.status(500).json({ message: 'Third-party verification failed' });
  }
});

module.exports = router;