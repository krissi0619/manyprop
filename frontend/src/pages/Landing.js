import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import propertyHero from '../assets/property_hero.png';
import SEO from '../components/Common/SEO';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If already logged in, skip landing page → home
    const token = localStorage.getItem('mp_token');
    const user  = localStorage.getItem('mp_user');
    if (token && user) {
      navigate('/home', { replace: true });
      return;
    }
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, [navigate]);

  const handleGetStarted = () => navigate('/register');
  const handleLogin      = () => navigate('/login');
  const handleGuest      = () => {
    // Mark as guest in sessionStorage (not persisted across tabs)
    sessionStorage.setItem('mp_guest', 'true');
    navigate('/home');
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ManyProp",
    "url": "https://manyprop.onrender.com",
    "description": "India's most trusted property platform with 100% owner listings and zero brokerage.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://manyprop.onrender.com/properties?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className={`landing-page${loaded ? ' landing-loaded' : ''}`}>
      <SEO 
        title="India's Most Trusted Property Platform | No Brokerage"
        description="ManyProp is India's premier zero brokerage real estate platform. Browse 100% verified properties directly from owners. Find your dream home, apartment, flat, or villa today."
        keywords="ManyProp, no brokerage real estate, buy verified houses, rent zero brokerage flats, direct owners real estate, apartment Baben, flat Pune"
        schema={websiteSchema}
      />
      {/* Ambient orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />

      <div className="landing-inner">
        {/* ─── Brand ─────────────────────────────── */}
        <div className="landing-brand">
          <div className="landing-logo-mark">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M4 22V12L14 4L24 12V22H17V16H11V22H4Z" fill="currentColor" opacity="0.9"/>
              <rect x="11" y="16" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <span className="landing-logo-text">ManyProp</span>
        </div>

        {/* ─── Tagline ────────────────────────────── */}
        <div className="landing-hero-text">
          <h1 className="landing-headline">
            India's most trusted<br />property platform.
          </h1>
          <p className="landing-subline">
            Real owners. Real prices. Real deals.
          </p>
        </div>

        {/* ─── Hero image ─────────────────────────── */}
        <div className="landing-hero-img-wrapper">
          <img
            src={propertyHero}
            alt="Property collage"
            className="landing-hero-img"
          />
          <div className="landing-img-overlay" />
          <div className="landing-chip landing-chip-1">
            <span className="chip-num">2L+</span>
            <span className="chip-label">Verified listings</span>
          </div>
          <div className="landing-chip landing-chip-2">
            <span className="chip-num">₹0</span>
            <span className="chip-label">Brokerage</span>
          </div>
          <div className="landing-chip landing-chip-3">
            <span className="chip-num">100%</span>
            <span className="chip-label">Owner direct</span>
          </div>
        </div>

        {/* ─── CTAs ───────────────────────────────── */}
        <div className="landing-actions">
          <button
            id="landing-get-started"
            className="landing-btn landing-btn-primary"
            onClick={handleGetStarted}
          >
            Get started
          </button>
          <button
            id="landing-login"
            className="landing-btn landing-btn-outline"
            onClick={handleLogin}
          >
            Login to existing account
          </button>
          <button
            id="landing-guest"
            className="landing-btn-ghost"
            onClick={handleGuest}
          >
            Browse as guest <span className="arrow">→</span>
          </button>
        </div>

        {/* ─── Why section ────────────────────────── */}
        <div className="landing-why">
          <p className="landing-why-title">Why ManyProp?</p>
          <div className="landing-why-chips">
            <div className="landing-why-chip"><span className="why-icon">✓</span>Verified owners only</div>
            <div className="landing-why-chip"><span className="why-icon">📊</span>Real market prices</div>
            <div className="landing-why-chip"><span className="why-icon">🤝</span>Zero brokerage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
