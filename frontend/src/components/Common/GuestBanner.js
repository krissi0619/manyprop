import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestBanner.css';

/**
 * GuestBanner — shown to non-logged-in users browsing the site.
 * Prompts them to sign up or log in for full access.
 */
const GuestBanner = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('mp_token');
  const isGuest    = sessionStorage.getItem('mp_guest') === 'true';

  // Only show if guest (not logged in)
  if (isLoggedIn || !isGuest) return null;

  return (
    <div className="guest-banner" id="guest-mode-banner">
      <div className="guest-banner-content">
        <span className="guest-banner-icon">👁️</span>
        <span className="guest-banner-text">
          You're browsing as a guest. <strong>Login or sign up</strong> to buy, rent, save properties or post listings.
        </span>
      </div>
      <div className="guest-banner-actions">
        <button
          className="guest-banner-btn guest-banner-login"
          onClick={() => navigate('/login')}
          id="guest-banner-login-btn"
        >
          Login
        </button>
        <button
          className="guest-banner-btn guest-banner-signup"
          onClick={() => navigate('/register')}
          id="guest-banner-signup-btn"
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
};

export default GuestBanner;
