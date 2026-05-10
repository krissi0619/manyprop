import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';
import { API_AUTH } from '../api/config';

// ── Step identifiers ─────────────────────────────────────────────────────────
const STEPS = {
  LOGIN: 'login',
  OTP: 'otp',
  ACCOUNT_CREATE: 'acct',
  CREATE_DETAILS: 'details',
  PROFILE: 'profile',
  PREFERENCES: 'preferences',
  PROPERTY_DETAILS: 'propdetails',
  AGENT_DETAILS: 'agent_details',
  DEVELOPER_DETAILS: 'dev_details',
  KYC: 'kyc',
};

const STEP_LABELS = {
  [STEPS.LOGIN]: 'login / register',
  [STEPS.OTP]: 'otp',
  [STEPS.ACCOUNT_CREATE]: 'continue with google',
  [STEPS.CREATE_DETAILS]: 'create your account',
  [STEPS.PROFILE]: 'Profile Details',
  [STEPS.PREFERENCES]: 'Preferences',
  [STEPS.PROPERTY_DETAILS]: 'Preferences',
  [STEPS.AGENT_DETAILS]: 'Preferences',
  [STEPS.DEVELOPER_DETAILS]: 'Preferences',
  [STEPS.KYC]: 'KYC  for Developer',
};

// ── Google SVG icon ───────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.38-8.16 2.38-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// ── Back arrow icon ───────────────────────────────────────────────────────────
const BackArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Close (×) icon ────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════════════════════════════
const Login = () => {
  const navigate = useNavigate();
  const fileInputRef    = useRef(null);
  const ownershipRef    = useRef(null);
  const propImageRef    = useRef(null);

  // ── Navigation state ────────────────────────────────
  const [step, setStep] = useState(STEPS.LOGIN);
  const [flow, setFlow] = useState('login'); // 'login' | 'register' | 'google'

  // ── UI state ─────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOTP, setDevOTP] = useState('');

  // ── Step 1 – Login ────────────────────────────────────
  const [loginPhone, setLoginPhone] = useState('');

  // ── Step 2 – OTP ─────────────────────────────────────
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // ── Steps 3 & 4 – Registration data ──────────────────
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    isAgent: false,
  });

  // ── Step 5 – Profile data ─────────────────────────────
  const [profileData, setProfileData] = useState({
    userType: 'Buyer / Tenant',
    occupation: '',
    annualIncome: '',
    location: '',
    avatarUrl: '',
  });

  // ── Step 6a – Buyer/Tenant Preferences ───────────────
  const [prefData, setPrefData] = useState({
    propertyTypes: [],   // multi-select chips
    location: '',
    budget: '',
    configuration: '',
    furnishingStatus: '',
    occupancyType: '',
    keyAmenities: '',
    moveInTimeline: '',
  });

  // ── Step 6b – Owner Property Details ─────────────────
  const [propData, setPropData] = useState({
    propertyType: '',
    address: '',
    areaDetails: '',
    ownershipProofName: '',
    propertyImageName: '',
  });

  // ── Step 7 – Agent/Broker property details ────────────
  const [agentData, setAgentData] = useState({
    reraRegistration: '',
    companyName: '',
    operatingLocalities: '',
    reraAgentLicense: '',
    gstNumber: '',
  });

  // ── Step 7 – Developer/Builder property details ────────
  const [devData, setDevData] = useState({
    entityType: '',
    companyUrl: '',
    cin: '',
    reraRegistration: '',
  });

  // ── Step 8 – KYC data ─────────────────────────
  const [kycData, setKycData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    clearanceDocName: '',
    aadhaarVerified: false,
    panVerified: false,
  });
  const kycDocRef = useRef(null);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState(null);
  const [isUTypeOpen, setIsUTypeOpen] = useState(false);

  // ── Auth token held until profile complete ────────────
  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState(null);

  // ── Helpers ───────────────────────────────────────────
  const clearError = () => setError('');

  const goHome = (token, user) => {
    localStorage.setItem('mp_token', token);
    localStorage.setItem('mp_user', JSON.stringify(user));
    navigate('/home');
    window.location.reload();
  };

  // ── Back navigation logic ─────────────────────────────
  const handleBack = () => {
    clearError();
    switch (step) {
      case STEPS.LOGIN:
        navigate(-1);
        break;
      case STEPS.OTP:
        setOtp(['', '', '', '', '', '']);
        setDevOTP('');
        if (flow === 'register') setStep(STEPS.CREATE_DETAILS);
        else if (flow === 'google') setStep(STEPS.ACCOUNT_CREATE);
        else setStep(STEPS.LOGIN);
        break;
      case STEPS.ACCOUNT_CREATE:
        setFlow('login');
        setStep(STEPS.LOGIN);
        break;
      case STEPS.CREATE_DETAILS:
        setFlow('login');
        setStep(STEPS.LOGIN);
        break;
      case STEPS.PROFILE:
        // Profile is the last step – nothing to go back to
        break;
      default:
        navigate(-1);
    }
  };

  const handleClose = () => navigate('/home');

  // ── Card nav header (shared) ──────────────────────────
  const CardNav = ({ showBack = true, customBack }) => (
    <div className="card-nav">
      {showBack ? (
        <button className="nav-back-btn" onClick={customBack || handleBack} type="button">
          <BackArrow /> Back
        </button>
      ) : <div />}
      <button className="nav-close-btn" onClick={handleClose} type="button">
        <CloseIcon />
      </button>
    </div>
  );

  // ── Terms footer (shared) ─────────────────────────────
  const TermsFooter = () => (
    <div className="terms-text">
      By registering you agree to our{' '}
      <a href="/terms" onClick={e => e.preventDefault()}>Terms of Service</a>
      {' '}& <a href="/privacy" onClick={e => e.preventDefault()}>Privacy Policy</a>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  //  API CALLS
  // ────────────────────────────────────────────────────────────────────────────

  // Send OTP (used by Step 1 login and Step 4 create-details)
  const apiSendOTP = async (phone, extras = {}) => {
    setLoading(true);
    clearError();
    try {
      const res = await axios.post(`${API_AUTH}/send-otp`, {
        phone,
        ...extras,
      });
      if (res.data.devOTP) setDevOTP(res.data.devOTP);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Step 2)
  const apiVerifyOTP = async (phone, otpVal, extras = {}) => {
    setLoading(true);
    clearError();
    try {
      const res = await axios.post(`${API_AUTH}/verify-otp`, {
        phone,
        otp: otpVal,
        ...extras,
      });

      if (res.data.success) {
        const { token, user, isNewUser } = res.data;
        if (user.role === 'admin') {
          localStorage.setItem('mp_token', token);
          localStorage.setItem('mp_user', JSON.stringify(user));
          navigate('/admin/dashboard');
          window.location.reload();
        } else if (isNewUser || !user.profileComplete) {
          // New user or incomplete profile → show profile step
          setAuthToken(token);
          setAuthUser(user);
          setProfileData(prev => ({ 
            ...prev, 
            avatarUrl: user.profile?.avatar || '',
            userType: user.userType || 'Buyer / Tenant'
          }));
          setStep(STEPS.PROFILE);
        } else {
          // Existing user → log in
          goHome(token, user);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Complete profile (Step 5) → route to next step based on userType
  const apiCompleteProfile = async () => {
    setLoading(true);
    clearError();
    try {
      const res = await axios.put(
        `${API_AUTH}/complete-profile`,
        {
          userType: profileData.userType,
          occupation: profileData.occupation,
          annualIncome: profileData.annualIncome,
          location: profileData.location,
          avatar: profileData.avatarUrl || '',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const savedUser = res.data.user || authUser;
      setAuthUser(savedUser);

      // Route to next step based on userType
      const uType = profileData.userType;
      if (uType === 'Buyer / Tenant' || uType === 'Buyer' || uType === 'Tenant') {
        setStep(STEPS.PREFERENCES);
      } else if (uType === 'Owner' || uType === 'Landlord') {
        setStep(STEPS.PROPERTY_DETAILS);
      } else if (uType === 'Agent') {
        setStep(STEPS.AGENT_DETAILS);
      } else if (uType === 'Builder') {
        setStep(STEPS.DEVELOPER_DETAILS);
      } else {
        goHome(authToken, savedUser);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save preferences (Step 6a) then navigate home
  const apiSavePreferences = async (skip = false) => {
    setLoading(true);
    try {
      if (!skip) {
        await axios.put(
          `${API_AUTH}/save-preferences`,
          {
            propertyTypes: prefData.propertyTypes,
            location: prefData.location,
            budget: prefData.budget,
            configuration: prefData.configuration,
            furnishingStatus: prefData.furnishingStatus,
            occupancyType: prefData.occupancyType,
            keyAmenities: prefData.keyAmenities,
            moveInTimeline: prefData.moveInTimeline,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => {}); // silent fail – not blocking
      }
      goHome(authToken, authUser);
    } catch (err) {
      goHome(authToken, authUser); // always navigate regardless
    } finally {
      setLoading(false);
    }
  };

  // Toggle a property type chip
  const togglePropType = (type) => {
    setPrefData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  // Save agent details then KYC
  const apiSaveAgentDetails = async (skip = false) => {
    setLoading(true);
    try {
      if (!skip) {
        await axios.put(
          `${API_AUTH}/save-agent-details`,
          agentData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => {});
      }
      setStep(STEPS.KYC);
    } catch (err) {
      setStep(STEPS.KYC);
    } finally {
      setLoading(false);
    }
  };

  // Save developer details then go to KYC
  const apiSaveDevDetails = async (skip = false) => {
    setLoading(true);
    try {
      if (!skip) {
        await axios.put(
          `${API_AUTH}/save-developer-details`,
          devData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => {});
      }
      setStep(STEPS.KYC);
    } catch (err) {
      setStep(STEPS.KYC);
    } finally {
      setLoading(false);
    }
  };

  // Save KYC data then go home
  const apiSaveKYC = async (skip = false) => {
    setLoading(true);
    try {
      if (!skip) {
        await axios.put(
          `${API_AUTH}/save-kyc`,
          {
            aadhaarNumber: kycData.aadhaarNumber,
            panNumber: kycData.panNumber,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch(() => {});
      }
      goHome(authToken, authUser);
    } catch (err) {
      goHome(authToken, authUser);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  //  STEP HANDLERS
  // ────────────────────────────────────────────────────────────────────────────

  // Step 1 – Send OTP from login screen
  const handleLoginSendOTP = async (e) => {
    e.preventDefault();
    const raw = (loginPhone || '').trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    const digitsOnly = raw.replace(/\D/g, '');
    const isPhone = digitsOnly.length === 10;

    if (!isEmail && !isPhone) {
      setError('Please enter a valid 10-digit mobile number or email address');
      return;
    }

    setFlow('login');
    if (isEmail) {
      await apiSendOTP('', { email: raw });
    } else {
      // Always send clean 10-digit number
      await apiSendOTP(digitsOnly);
    }
  };

  // Step 2 – Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpVal = otp.join('');
    if (otpVal.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    const phone = flow === 'register' ? regData.phone : loginPhone;
    const extras =
      flow === 'register'
        ? {
            name: regData.name,
            email: regData.email,
            isAgent: regData.isAgent,
            userType: regData.isAgent ? 'Agent' : 'Buyer / Tenant',
          }
        : flow === 'google'
        ? { isAgent: regData.isAgent, userType: regData.isAgent ? 'Agent' : 'Buyer / Tenant' }
        : {};
    await apiVerifyOTP(phone, otpVal, extras);
  };

  // Resend OTP
  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (loading) return;
    const phone = flow === 'register' ? regData.phone : loginPhone;
    setOtp(['', '', '', '', '', '']);
    setDevOTP('');
    await apiSendOTP(phone);
  };

  // Step 3 – Google account creation → real Google SSO Flow
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      clearError();
      try {
        const res = await axios.post(`${API_AUTH}/google`, {
          token: tokenResponse.access_token,
          isAgent: regData.isAgent,
          userType: regData.isAgent ? 'Agent' : 'Buyer / Tenant'
        });
        
        if (res.data.success) {
          const { token, user, isNewUser } = res.data;
          if (user.role === 'admin') {
            localStorage.setItem('mp_token', token);
            localStorage.setItem('mp_user', JSON.stringify(user));
            navigate('/admin/dashboard');
            window.location.reload();
          } else if (isNewUser || !user.profileComplete) {
            setAuthToken(token);
            setAuthUser(user);
            setProfileData(prev => ({ 
              ...prev, 
              avatarUrl: user.profile?.avatar || '',
              userType: user.userType || 'Buyer / Tenant'
            }));
            setStep(STEPS.PROFILE);
          } else {
            goHome(token, user);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleGoogleAccountContinue = async (e) => {
    e.preventDefault();
    const cleanPhone = (regData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    await apiSendOTP(regData.phone, {
      name: 'Google User',
      email: `google_${regData.phone}@manyprop.app`,
      isAgent: regData.isAgent,
      userType: regData.isAgent ? 'Agent' : 'Buyer / Tenant',
    });
  };

  // Step 4 – Create details → send OTP
  const handleCreateDetailsContinue = async (e) => {
    e.preventDefault();
    if (!regData.name.trim()) { setError('Please enter your name'); return; }
    const cleanPhone = (regData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setFlow('register');
    await apiSendOTP(regData.phone, {
      name: regData.name,
      email: regData.email,
      isAgent: regData.isAgent,
      userType: regData.isAgent ? 'Agent' : 'Buyer / Tenant',
    });
  };

  // Step 5 – Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await apiCompleteProfile();
  };

  // Google button click → go to account_create step
  const handleGoogleClick = () => {
    setFlow('google');
    setRegData({ name: '', phone: '', email: '', isAgent: false });
    clearError();
    setStep(STEPS.ACCOUNT_CREATE);
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      clearError();
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Avatar file change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setProfileData(prev => ({ ...prev, avatarUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  // ────────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────────────────────────────────

  // ── STEP 1: Login here ───────────────────────────────
  if (step === STEPS.LOGIN) {
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.LOGIN]}</span>

        <div className="login-card" key="step-login">
          <CardNav />

          <h1 className="card-title">Login here</h1>
          <p className="card-subtitle">
            Join 2 lakh+ verified users finding their perfect home
          </p>

          <form onSubmit={handleLoginSendOTP}>
            <div className="field-group">
              <label className="field-label">Enter Phone / Email</label>
              <div className="phone-row" style={{ paddingLeft: loginPhone && !/^\d+$/.test(loginPhone) ? '16px' : undefined }}>
                {(!loginPhone || /^\d+$/.test(loginPhone)) && <span className="phone-prefix">+91</span>}
                <input
                  id="login-phone"
                  className="phone-input"
                  type="text"
                  placeholder="9876543210 or email@example.com"
                  value={loginPhone}
                  onChange={e => {
                    clearError();
                    setLoginPhone(e.target.value);
                  }}
                  autoFocus
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send otp'}
            </button>
          </form>

          <div className="or-divider">or</div>

          <button className="btn-google" type="button" onClick={() => googleLoginHandler()}>
            <GoogleIcon />
            Continue with google
          </button>

          <div className="new-user-row">
            New User ?{' '}
            <a
              href="#register"
              onClick={e => {
                e.preventDefault();
                setRegData({ name: '', phone: '', email: '', isAgent: false });
                clearError();
                setStep(STEPS.CREATE_DETAILS);
              }}
            >
              Create new Account
            </a>
          </div>

          <TermsFooter />
        </div>
      </div>
    );
  }

  // ── STEP 2: Enter OTP ────────────────────────────────
  if (step === STEPS.OTP) {
    const displayPhone = flow === 'register' ? regData.phone : loginPhone;
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.OTP]}</span>

        <div className="login-card" key="step-otp">
          <CardNav />

          <h2 className="otp-title">Enter OTP</h2>
          <p className="otp-subtitle">
            We sent a 6-digit OTP to{' '}
            <strong style={{ color: '#111' }}>
              {/^\d+$/.test(displayPhone) ? `+91 ${displayPhone}` : displayPhone}
            </strong>
          </p>

          {devOTP && (
            <div className="dev-otp-hint">
              📨 Dev OTP:{' '}
              <strong style={{ fontSize: '1rem', letterSpacing: '3px', color: '#111' }}>
                {devOTP}
              </strong>
            </div>
          )}

          <form onSubmit={handleVerifyOTP}>
            <div className="otp-grid">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className={`otp-circle${digit ? ' filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  autoComplete="off"
                />
              ))}
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="new-user-row" style={{ marginTop: '18px' }}>
            Didn't receive OTP?{' '}
            <a href="#resend" onClick={handleResendOTP}>
              {loading ? 'Sending...' : 'Resend OTP'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: Account creation (Google flow) ───────────
  if (step === STEPS.ACCOUNT_CREATE) {
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.ACCOUNT_CREATE]}</span>

        <div className="login-card" key="step-acct-create">
          <CardNav />

          <h1 className="card-title">Account creation</h1>

          <form onSubmit={handleGoogleAccountContinue}>
            <div className="field-group">
              <label className="field-label">Enter Phone number</label>
              <div className="phone-row">
                <span className="phone-prefix">+91</span>
                <input
                  id="acct-phone"
                  className="phone-input"
                  type="tel"
                  placeholder="9876543210"
                  value={regData.phone}
                  onChange={e => {
                    clearError();
                    setRegData(prev => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    }));
                  }}
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <div className="agent-question">
              <label className="agent-label">
                Are you a Real-estate <span className="accent">Agent</span>
              </label>
              <div className="agent-toggle">
                <button
                  type="button"
                  className={`agent-btn${regData.isAgent ? ' selected-yes' : ''}`}
                  onClick={() => setRegData(prev => ({ ...prev, isAgent: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`agent-btn${!regData.isAgent ? ' selected-no' : ''}`}
                  onClick={() => setRegData(prev => ({ ...prev, isAgent: false }))}
                >
                  No
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : 'Continue'}
            </button>
          </form>

          <TermsFooter />
        </div>
      </div>
    );
  }

  // ── STEP 4: Create your account ──────────────────────
  if (step === STEPS.CREATE_DETAILS) {
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.CREATE_DETAILS]}</span>

        <div className="login-card" key="step-create-details">
          <CardNav />

          <h1 className="card-title">Create your account</h1>

          <form onSubmit={handleCreateDetailsContinue}>
            <div className="field-group">
              <label className="field-label">Enter your name</label>
              <input
                id="reg-name"
                className="pill-input"
                type="text"
                placeholder="Rahul sharma"
                value={regData.name}
                onChange={e => {
                  clearError();
                  setRegData(prev => ({ ...prev, name: e.target.value }));
                }}
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Enter Phone number</label>
              <div className="phone-row">
                <span className="phone-prefix">+91</span>
                <input
                  id="reg-phone"
                  className="phone-input"
                  type="tel"
                  placeholder="9876543210"
                  value={regData.phone}
                  onChange={e => {
                    clearError();
                    setRegData(prev => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    }));
                  }}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Enter email address</label>
              <input
                id="reg-email"
                className="pill-input"
                type="email"
                placeholder="rahul@gmail.com"
                value={regData.email}
                onChange={e => {
                  clearError();
                  setRegData(prev => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>

            <div className="agent-question">
              <label className="agent-label">
                Are you a Real-estate <span className="accent">Agent</span>
              </label>
              <div className="agent-toggle">
                <button
                  type="button"
                  className={`agent-btn${regData.isAgent ? ' selected-yes' : ''}`}
                  onClick={() => setRegData(prev => ({ ...prev, isAgent: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`agent-btn${!regData.isAgent ? ' selected-no' : ''}`}
                  onClick={() => setRegData(prev => ({ ...prev, isAgent: false }))}
                >
                  No
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>

          <TermsFooter />
        </div>
      </div>
    );
  }

  // ── STEP 5: Profile Details ──────────────────────────
  if (step === STEPS.PROFILE) {
    const displayName = authUser?.name || 'Your Name';

    return (
      <div className="login-page profile-bg">
        <span className="step-label-overlay" style={{ color: '#999' }}>
          {STEP_LABELS[STEPS.PROFILE]}
        </span>

        <div className="login-card profile-card" key="step-profile">
          <h1 className="card-title" style={{ marginBottom: '24px' }}>Profile Details</h1>

          <form onSubmit={handleSaveProfile}>
            {/* Avatar */}
            <div className="avatar-row">
              <div
                className="avatar-circle-wrap"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload photo"
              >
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Profile" />
                ) : (
                  <span className="avatar-placeholder-icon">👤</span>
                )}
              </div>
              <div className="avatar-info">
                <h4>{displayName}</h4>
                <button
                  type="button"
                  className="update-img-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Update image
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* I am a */}
            <div className="field-group" style={{ position: 'relative' }}>
              <label className="field-label">I am a</label>
              
              <div 
                className="custom-dropdown-trigger select-pill" 
                onClick={() => setIsUTypeOpen(!isUTypeOpen)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '30px',
                  border: '1.2px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: '#fff',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <span>
                  {
                    [
                      { label: 'Buyer / Tenant', value: 'Buyer / Tenant' },
                      { label: 'Developer/ Builder', value: 'Builder' },
                      { label: 'Owner', value: 'Owner' },
                      { label: 'Agent/ Broker', value: 'Agent' },
                    ].find(ut => ut.value === profileData.userType)?.label || profileData.userType
                  }
                </span>
                <span style={{ fontSize: '10px', color: '#111' }}>▼</span>
              </div>
              
              {isUTypeOpen && (
                <div className="custom-dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%', left: 0, right: 0,
                  marginTop: '8px', zIndex: 10,
                  background: '#fff',
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1px solid #eee'
                }}>
                  {[
                    { label: 'Buyer / Tenant', value: 'Buyer / Tenant' },
                    { label: 'Developer/ Builder', value: 'Builder' },
                    { label: 'Owner', value: 'Owner' },
                    { label: 'Agent/ Broker', value: 'Agent' },
                  ].map(ut => (
                    <button
                      key={ut.value}
                      type="button"
                      className="custom-dropdown-item"
                      style={{
                        padding: '12px 20px',
                        borderRadius: '30px',
                        border: '1.2px solid #222',
                        background: '#fff',
                        color: '#111',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.background = '#f5f5f5'; 
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.background = '#fff'; 
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => {
                        setProfileData(prev => ({ ...prev, userType: ut.value }));
                        setIsUTypeOpen(false);
                      }}
                    >
                      {ut.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Occupation */}
            <div className="field-group">
              <label className="field-label">Occupation</label>
              <input
                id="profile-occupation"
                className="pill-input"
                type="text"
                placeholder="e.g. Software Engineer"
                value={profileData.occupation}
                onChange={e =>
                  setProfileData(prev => ({ ...prev, occupation: e.target.value }))
                }
              />
            </div>

            {/* Annual Income */}
            <div className="field-group">
              <label className="field-label">Annual Income</label>
              <input
                id="profile-income"
                className="pill-input"
                type="text"
                placeholder="e.g. 1200000"
                value={profileData.annualIncome}
                onChange={e =>
                  setProfileData(prev => ({ ...prev, annualIncome: e.target.value }))
                }
              />
            </div>

            {/* Location */}
            <div className="field-group">
              <label className="field-label">Location</label>
              <input
                id="profile-location"
                className="pill-input"
                type="text"
                placeholder="e.g. Andheri West, Mumbai"
                value={profileData.location}
                onChange={e =>
                  setProfileData(prev => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              id="profile-save-btn"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Saving...' : 'Save and continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── STEP 6a: Preferences (Buyer / Tenant) ───────────
  if (step === STEPS.PREFERENCES) {
    const PROP_TYPES = ['Flat', 'Villa', 'Apartment', 'Plot', 'Commercial', 'Bunglow'];
    const AMENITIES  = ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Garden', 'Clubhouse', 'Power Backup'];
    const displayType = profileData.userType || 'Buyer / Tenant';
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.PREFERENCES]}</span>
        {/* user-type badge at top-right */}
        <div className="pref-type-badge-bar">
          <span className="pref-type-badge">{displayType}</span>
        </div>

        <div className="login-card pref-card" key="step-prefs">
          <h1 className="card-title" style={{ fontSize: '1.65rem' }}>What are you looking for?</h1>
          <p className="pref-subtitle">We'll personalise your feed based on this<br/>— takes 30 seconds</p>

          {/* Property type chips */}
          <div className="field-group">
            <div className="prop-chips-wrap">
              {PROP_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`prop-chip${prefData.propertyTypes.includes(type) ? ' active' : ''}`}
                  onClick={() => togglePropType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Preferred Location</label>
            <input id="pref-location" className="pill-input" type="text" placeholder="e.g. Andheri west"
              value={prefData.location}
              onChange={e => setPrefData(p => ({ ...p, location: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Budget</label>
            <input id="pref-budget" className="pill-input" type="text" placeholder="e.g. 2650000"
              value={prefData.budget}
              onChange={e => setPrefData(p => ({ ...p, budget: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Configuration</label>
            <input id="pref-config" className="pill-input" type="text" placeholder="e.g. 3 BHK"
              value={prefData.configuration}
              onChange={e => setPrefData(p => ({ ...p, configuration: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Furnishing Status</label>
            <input id="pref-furnishing" className="pill-input" type="text" placeholder="e.g. Fully furnished"
              value={prefData.furnishingStatus}
              onChange={e => setPrefData(p => ({ ...p, furnishingStatus: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Occupancy Type</label>
            <input id="pref-occupancy" className="pill-input" type="text" placeholder="e.g. Family"
              value={prefData.occupancyType}
              onChange={e => setPrefData(p => ({ ...p, occupancyType: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Key Amenities</label>
            <select id="pref-amenities" className="select-pill"
              value={prefData.keyAmenities}
              onChange={e => setPrefData(p => ({ ...p, keyAmenities: e.target.value }))}>
              <option value="">Select</option>
              {AMENITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Move-in Timeline</label>
            <input id="pref-movein" className="pill-input" type="text" placeholder="e.g. Within a week"
              value={prefData.moveInTimeline}
              onChange={e => setPrefData(p => ({ ...p, moveInTimeline: e.target.value }))} />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="button" className="btn-primary" disabled={loading}
            onClick={() => apiSavePreferences(false)} style={{ marginTop: '8px' }}>
            {loading ? 'Saving...' : 'Show my matches'}
          </button>
          <button type="button" className="btn-secondary" disabled={loading}
            onClick={() => apiSavePreferences(true)}>
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 6b: Property Details (Owner / Landlord / Builder) ──
  if (step === STEPS.PROPERTY_DETAILS) {
    const displayType = profileData.userType || 'Owner';
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.PROPERTY_DETAILS]}</span>
        <div className="pref-type-badge-bar">
          <span className="pref-type-badge">{displayType}</span>
        </div>

        <div className="login-card pref-card" key="step-prop-details">
          <h1 className="card-title" style={{ fontSize: '1.65rem' }}>Property Details</h1>
          <p className="pref-subtitle">We'll personalise your feed based on this<br/>— takes 30 seconds</p>

          <div className="field-group">
            <label className="field-label">Property Type</label>
            <input id="pd-type" className="pill-input" type="text" placeholder="e.g. Apartment"
              value={propData.propertyType}
              onChange={e => setPropData(p => ({ ...p, propertyType: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Property Address And Pincode</label>
            <input id="pd-address" className="pill-input" type="text" placeholder="e.g. 400082"
              value={propData.address}
              onChange={e => setPropData(p => ({ ...p, address: e.target.value }))} />
          </div>

          <div className="field-group">
            <label className="field-label">Area Details (Buildup &amp; carpet)</label>
            <input id="pd-area" className="pill-input" type="text" placeholder="e.g. 1200 sq ft"
              value={propData.areaDetails}
              onChange={e => setPropData(p => ({ ...p, areaDetails: e.target.value }))} />
          </div>

          {/* Ownership Proof Upload */}
          <div className="field-group">
            <label className="field-label">Ownership Proof</label>
            <div className="upload-area" onClick={() => ownershipRef.current?.click()}>
              {propData.ownershipProofName
                ? <span className="upload-done">✓ {propData.ownershipProofName}</span>
                : <>
                    <div className="upload-icon">📄</div>
                    <p>Click here to<br/><strong>Upload Document</strong></p>
                  </>}
            </div>
            <input ref={ownershipRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0];
                if (f) setPropData(p => ({ ...p, ownershipProofName: f.name }));
              }} />
          </div>

          {/* Property Image Upload */}
          <div className="field-group">
            <label className="field-label">Upload property image</label>
            <div className="upload-area" onClick={() => propImageRef.current?.click()}>
              {propData.propertyImageName
                ? <span className="upload-done">✓ {propData.propertyImageName}</span>
                : <>
                    <div className="upload-icon">🏠</div>
                    <p>click here to<br/><strong>Upload image</strong></p>
                  </>}
            </div>
            <input ref={propImageRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files[0];
                if (f) setPropData(p => ({ ...p, propertyImageName: f.name }));
              }} />
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="prop-detail-actions">
            <button type="button" className="btn-secondary" disabled={loading}
              onClick={() => goHome(authToken, authUser)}>
              Skip for now
            </button>
            <button type="button" className="btn-primary" disabled={loading}
              style={{ flex: 1 }}
              onClick={() => setStep(STEPS.KYC)}>
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 7: Agent / Broker Property Details ────────────
  if (step === STEPS.AGENT_DETAILS) {
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.AGENT_DETAILS]}</span>
        <div className="pref-type-badge-bar">
          <span className="pref-type-badge">Agent / Broker</span>
        </div>
        <div className="login-card pref-card" key="step-agent">
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>Property Details</h1>
          <p className="pref-subtitle">We'll personalise your feed based on this<br/>— takes 30 seconds</p>

          <div className="field-group">
            <label className="field-label">RERA Registration Number</label>
            <input id="ag-rera" className="pill-input" type="text" placeholder="e.g. efbihbka6230"
              value={agentData.reraRegistration}
              onChange={e => setAgentData(p => ({ ...p, reraRegistration: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">Company/Agency Name</label>
            <input id="ag-company" className="pill-input" type="text" placeholder="e.g. Lakhmi Properties"
              value={agentData.companyName}
              onChange={e => setAgentData(p => ({ ...p, companyName: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">Operating Localities</label>
            <input id="ag-locality" className="pill-input" type="text" placeholder="e.g. Dwarka Delhi"
              value={agentData.operatingLocalities}
              onChange={e => setAgentData(p => ({ ...p, operatingLocalities: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">RERA Agent License</label>
            <input id="ag-license" className="pill-input" type="text" placeholder="e.g. efbihbka6230"
              value={agentData.reraAgentLicense}
              onChange={e => setAgentData(p => ({ ...p, reraAgentLicense: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">GST Number</label>
            <input id="ag-gst" className="pill-input" type="text" placeholder="e.g. 07AAPFU0939F1ZV"
              value={agentData.gstNumber}
              onChange={e => setAgentData(p => ({ ...p, gstNumber: e.target.value }))} />
          </div>

          {error && <div className="error-box">{error}</div>}
          <div className="prop-detail-actions">
            <button type="button" className="btn-secondary" disabled={loading}
              onClick={() => apiSaveAgentDetails(true)}>Skip for now</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={loading}
              onClick={() => apiSaveAgentDetails(false)}>
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 7: Developer / Builder Property Details ────────
  if (step === STEPS.DEVELOPER_DETAILS) {
    return (
      <div className="login-page">
        <span className="step-label-overlay">{STEP_LABELS[STEPS.DEVELOPER_DETAILS]}</span>
        <div className="pref-type-badge-bar">
          <span className="pref-type-badge">Developer</span>
        </div>
        <div className="login-card pref-card" key="step-dev">
          <h1 className="card-title" style={{ fontSize: '1.8rem', textAlign: 'left', marginBottom: '16px' }}>Property Details</h1>
          <p className="pref-subtitle" style={{ textAlign: 'left' }}>We'll personalise your feed based on this<br/>— takes 30 seconds</p>

          <div className="field-group">
            <label className="field-label">Entity Type</label>
            <input id="dv-entity" className="pill-input" type="text" placeholder="e.g. Partnership, Private limited company"
              value={devData.entityType}
              onChange={e => setDevData(p => ({ ...p, entityType: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">Company URL</label>
            <input id="dv-url" className="pill-input" type="text" placeholder="e.g. Http//sjkhdsfo.com"
              value={devData.companyUrl}
              onChange={e => setDevData(p => ({ ...p, companyUrl: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">CIN (Corporate Identification Number)</label>
            <input id="dv-cin" className="pill-input" type="text" placeholder="e.g. U72200TN2011PTC079484"
              value={devData.cin}
              onChange={e => setDevData(p => ({ ...p, cin: e.target.value }))} />
          </div>
          <div className="field-group">
            <label className="field-label">RERA Registration</label>
            <input id="dv-rera" className="pill-input" type="text" placeholder="e.g. efbihbka6230"
              value={devData.reraRegistration}
              onChange={e => setDevData(p => ({ ...p, reraRegistration: e.target.value }))} />
          </div>

          {error && <div className="error-box">{error}</div>}
          <div className="prop-detail-actions">
            <button type="button" className="btn-secondary" disabled={loading}
              onClick={() => apiSaveDevDetails(true)}>Skip for now</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={loading}
              onClick={() => apiSaveDevDetails(false)}>
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.KYC) {
    const uType  = profileData.userType;
    const isDev  = uType === 'Builder';
    const isAgent = uType === 'Agent';
    const phone  = authUser?.phone  || '---';
    const email  = authUser?.email  || '';
    const phoneDone  = !!phone && phone !== '---';
    const emailDone  = !!email;

    const OWNER_CERTS = [
      {
        title: 'Encumbrance Certificate',
        desc: 'Proves the property is free from any active mortgages, loans, or legal disputes.'
      },
      {
        title: 'Property Tax Receipts',
        desc: 'Confirms up-to-date payments to local authorities, further validating possession.'
      },
      {
        title: '(PoA) for NRIs',
        desc: 'For NRIs: A registered Power of Attorney (PoA) is required if someone else is managing the transaction on their behalf.'
      }
    ];
    const DEV_APPROVALS = [
      { t: 'Approved Building from local municipal body.', d: '(eg- BMPA)' },
      { t: 'Commencement Certificate (CC).', d: 'Legal construction permission' },
      { t: 'Joint Development Agreement (JDA).', d: 'Agreement with the landowner.' },
      { t: 'Land Conversion Certificate.', d: 'agricultural to residential/commercial.' },
      { t: 'Regulatory NOCs.', d: 'Clearances from the fire department, pollution control board,\nwater supply, and electricity boards' },
    ];

    return (
      <div className="login-page">
        <span className="step-label-overlay" style={{ color: '#bbb' }}>
          {isDev ? 'KYC  for Developer' : isAgent ? 'KYC for Agent' : 'KYC for owner'}
        </span>

        <div className="login-card pref-card kyc-card" key="step-kyc">
          {/* Trust score header */}
          <h2 className="kyc-trust-title">Build your trust score</h2>
          <p className="kyc-trust-sub">Verified users get priority access and faster responses from owners</p>

          {/* KYC Section */}
          <h3 className="kyc-section-title">Verification (KYC)</h3>

          {/* Phone */}
          <div className="kyc-row">
            <div className="kyc-row-info">
              <span className="kyc-row-label">Phone number</span>
              <span className="kyc-row-value">+91 {phone}</span>
            </div>
            <span className={`kyc-badge ${phoneDone ? 'done' : 'verify'}`}>{phoneDone ? 'Done' : 'Verify'}</span>
          </div>

          {/* Aadhaar */}
          <div className="kyc-row">
            <div className="kyc-row-info">
              <span className="kyc-row-label">Adhaar verification</span>
              <input className="kyc-inline-input" type="text" placeholder="Add number"
                value={kycData.aadhaarNumber}
                onChange={e => setKycData(p => ({ ...p, aadhaarNumber: e.target.value }))}
                disabled={kycData.aadhaarVerified}
              />
            </div>
            {kycData.aadhaarVerified ? (
              <span className="kyc-badge done">Done</span>
            ) : (
              <button 
                type="button" 
                className="kyc-badge verify" 
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    const res = await axios.post(`${API_AUTH}/verify-document`, { type: 'aadhaar', number: kycData.aadhaarNumber });
                    if (res.data.success) {
                      setKycData(p => ({ ...p, aadhaarVerified: true }));
                      clearError();
                    }
                  } catch (err) {
                    setError(err.response?.data?.message || 'Invalid Aadhaar number');
                  }
                }}
              >Verify</button>
            )}
          </div>

          {/* PAN */}
          <div className="kyc-row">
            <div className="kyc-row-info">
              <span className="kyc-row-label">Pan Card</span>
              <input className="kyc-inline-input" type="text" placeholder="Add number"
                value={kycData.panNumber}
                onChange={e => setKycData(p => ({ ...p, panNumber: e.target.value }))}
                disabled={kycData.panVerified}
              />
            </div>
            {kycData.panVerified ? (
              <span className="kyc-badge done">Done</span>
            ) : (
              <button 
                type="button" 
                className="kyc-badge verify" 
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={async () => {
                  try {
                    const res = await axios.post(`${API_AUTH}/verify-document`, { type: 'pan', number: kycData.panNumber });
                    if (res.data.success) {
                      setKycData(p => ({ ...p, panVerified: true }));
                      clearError();
                    }
                  } catch (err) {
                    setError(err.response?.data?.message || 'Invalid PAN number');
                  }
                }}
              >Verify</button>
            )}
          </div>

          {/* Email */}
          <div className="kyc-row">
            <div className="kyc-row-info">
              <span className="kyc-row-label">Email address</span>
              <span className="kyc-row-value">{email || 'Not provided'}</span>
            </div>
            <span className={`kyc-badge ${emailDone ? 'done' : 'verify'}`}>{emailDone ? 'Done' : 'Verify'}</span>
          </div>

          {/* Clearance Certificates */}
          <h3 className="kyc-section-title" style={{ marginTop: '28px' }}>Clearance Certificates</h3>

          {isDev ? (
            <>
              <p className="kyc-certs-subtitle">Project Approvals</p>
              <div className="kyc-approvals-list">
                {DEV_APPROVALS.map((item, i) => (
                  <div key={i} className="kyc-dev-item">
                    <div className="kyc-dev-num">{i + 1}.</div>
                    <div className="kyc-dev-text">
                      <div className="kyc-dev-title">{item.t}</div>
                      <div className="kyc-dev-desc">{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isAgent ? (
            <div className="kyc-cert-rows">
              <div className="kyc-cert-row" style={{ display: 'block', paddingBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>1. Certificate of Incorporation</span>
              </div>
            </div>
          ) : (
            <div className="kyc-cert-rows">
              {OWNER_CERTS.map((cert, i) => (
                <div key={i} className="kyc-cert-row" style={{ position: 'relative' }}>
                  <span>{i + 1}. {cert.title}</span>
                  <button 
                    type="button" 
                    className="kyc-know-more-btn" 
                    onClick={() => setActiveTooltipIndex(activeTooltipIndex === i ? null : i)}
                    onMouseEnter={() => setActiveTooltipIndex(i)}
                    onMouseLeave={() => setActiveTooltipIndex(null)}
                  >
                    Know more
                  </button>
                  {activeTooltipIndex === i && (
                    <div className="kyc-tooltip-popup">
                      {cert.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload clearance docs */}
          <div className="upload-area kyc-upload" style={{ marginTop: '18px' }}
            onClick={() => kycDocRef.current?.click()}>
            {kycData.clearanceDocName
              ? <span className="upload-done">✓ {kycData.clearanceDocName}</span>
              : <>
                  <p style={{ color: '#111', fontSize: '0.85rem' }}>Click here to upload<br/><strong>{isAgent ? 'Certificate of Incorporation' : 'these Document'}</strong></p>
                </>}
          </div>
          <input ref={kycDocRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files[0];
              if (f) setKycData(p => ({ ...p, clearanceDocName: f.name }));
            }} />

          {error && <div className="error-box">{error}</div>}

          <div className="prop-detail-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary" disabled={loading}
              onClick={() => apiSaveKYC(true)}>Skip for now</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} disabled={loading}
              onClick={() => apiSaveKYC(false)}>
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;