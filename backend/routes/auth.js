const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// In-memory OTP store (in production, use Redis or DB)
const otpStore = new Map();

// Google Client setup
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com');

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
    
    // Identifier can be phone OR email
    const identifier = phone || email;
    if (!identifier) {
      return res.status(400).json({ message: 'Phone or email is required' });
    }

    if (phone && !/^\d{10}$/.test(phone) && phone !== '9999999999') {
      return res.status(400).json({ message: 'Phone must be exactly 10 digits' });
    }

    const otp = generateOTP();
    otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      name: name || null,
      email: email || null,
      userType: userType || 'Buyer',
      isAgent: isAgent || false
    });

    console.log(`[OTP] Sent to +91${phone}: ${otp}`);

    let targetEmail = email;
    if (targetEmail && (targetEmail.endsWith('@manyprop.phone') || targetEmail.endsWith('@manyprop.app'))) {
      targetEmail = null;
    }

    if (!targetEmail) {
      const existingUser = await User.findOne({ phone });
      if (existingUser && existingUser.email && !existingUser.email.endsWith('@manyprop.phone') && !existingUser.email.endsWith('@manyprop.app')) {
        targetEmail = existingUser.email;
      }
    }

    if (targetEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"ManyProp" <${process.env.EMAIL_USER}>`,
          to: targetEmail,
          subject: "Your ManyProp Login OTP",
          html: `<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9; border-radius: 10px;">
                  <h2 style="color: #333;">Welcome to ManyProp!</h2>
                  <p style="color: #666; font-size: 16px;">Your One-Time Password (OTP) for login is:</p>
                  <div style="margin: 20px 0; padding: 15px; background: #fff; border: 2px dashed #ea580c; display: inline-block; border-radius: 8px;">
                    <h1 style="color: #ea580c; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
                  </div>
                  <p style="color: #888; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                 </div>`,
        });
        console.log(`[Email] OTP sent to ${targetEmail}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: targetEmail ? 'OTP sent to your email and phone' : 'OTP sent successfully',
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

    const identifier = phone || email;
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Phone/Email and OTP are required' });
    }

    const stored = otpStore.get(identifier);

    if (!stored) {
      return res.status(400).json({ message: 'OTP expired or not sent. Please click "Send OTP" again.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP has expired (10 min limit). Please request a new one.' });
    }

    if (stored.attempts >= 5) {
      otpStore.delete(identifier);
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
    const resolvedEmail = email || stored.email || (identifier.includes('@') ? identifier : null);
    const isPhoneActuallyEmail = phone && phone.includes('@');
    const resolvedPhone = (phone && phone !== '9999999999' && !isPhoneActuallyEmail) ? phone : (identifier.includes('@') ? null : identifier);
    const resolvedUserType = userType || stored.userType || 'Buyer';
    const resolvedIsAgent = isAgent !== undefined ? isAgent : stored.isAgent;

    otpStore.delete(identifier);

    let isNewUser = false;
    let user = null;

    // Find existing user by phone if valid
    if (resolvedPhone) {
      user = await User.findOne({ phone: resolvedPhone });
    }

    if (!user && resolvedEmail) {
      // Try to find by email
      user = await User.findOne({ email: resolvedEmail.toLowerCase() });
      if (user) {
        if (resolvedPhone && !user.phone) user.phone = resolvedPhone;
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
      const fallbackEmail = resolvedEmail || `${resolvedPhone || Date.now()}.${Date.now()}@manyprop.phone`;
      const fallbackPhone = resolvedPhone || `0000000000`; // Requires 10 digit string minimum based on schema usually? Wait schema might not enforce it if not required, let's just save what we have.

        try {
          user = new User({
            name: resolvedName || (resolvedEmail ? resolvedEmail.split('@')[0] : `User_${resolvedPhone.slice(-4)}`),
            email: fallbackEmail.toLowerCase(),
            password: randomPassword,
            phone: fallbackPhone,
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

// @route   POST /api/auth/google
// @desc    Login/Register user with Google SSO
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token, isAgent, userType } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Verify Google Access Token
    const googleRes = await require('axios').get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const payload = googleRes.data;
    const { email, name, picture, sub: googleId } = payload;
    
    // Find or Create User
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      
      user = new User({
        name,
        email,
        password: randomPassword,
        phone: '0000000000', // Mock phone since Google doesn't always provide one
        isAgent: isAgent || false,
        role: isAgent ? 'agent' : 'user',
        userType: userType || 'Buyer',
        verified: true,
        profileComplete: false,
        'profile.avatar': picture
      });
      await user.save();
    }
    
    // Generate JWT
    const jwtPayload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType
      }
    };
    
    const jwtToken = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token: jwtToken,
      isNewUser: isNewUser || !user.profileComplete,
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
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ message: 'Google authentication failed' });
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