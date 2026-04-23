import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = ({ searchState, onSearchChange }) => {
  const { tab: activeTab, propertyFilter, city: searchQuery } = searchState || {};

  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const megaMenuRef = useRef(null);
  const navigate = useNavigate();

  const mainTabs = ['BUY', 'Rent', 'Sell'];

  // Property type tabs in the search card
  const propertyTypes = ['BUY', 'RENT', 'COMMERCIAL', 'PG', 'PLOTS', 'PROJECTS'];

  // Mapping each tab to URL query params (used only when Search button is clicked)
  const TAB_PARAMS = {
    'BUY':        { operation: 'buy' },
    'RENT':       { operation: 'rent' },
    'COMMERCIAL': { propertyType: 'commercial' },
    'PG':         { propertyType: 'pg' },
    'PLOTS':      { propertyType: 'plot' },
    'PROJECTS':   { propertyType: 'project' },
  };

  // Search input placeholder based on active tab
  const SEARCH_PLACEHOLDER = {
    'BUY':        'Search city or locality for properties to buy...',
    'RENT':       'Search city or locality for rental properties...',
    'COMMERCIAL': 'Search city or locality for commercial spaces...',
    'PG':         'Search city or locality for PG / co-living...',
    'PLOTS':      'Search city or locality for plots & land...',
    'PROJECTS':   'Search city or locality for new projects...',
  };

  // ── Handlers ────────────────────────────────────────────────

  // Tab click (BUY / RENT / COMMERCIAL / PG / PLOTS / PROJECTS):
  // Update homepage state — do NOT navigate
  const handleTabClick = (item) => {
    onSearchChange && onSearchChange({ tab: item });
    setIsFilterOpen(false);
    setActiveMegaMenu(null);
  };

  // Pill dropdown (Flat / Apartment, Villas, etc.)
  const handleFilterSelect = (value) => {
    onSearchChange && onSearchChange({ propertyFilter: value });
    setIsFilterOpen(false);
  };

  // City input change
  const handleCityChange = (e) => {
    onSearchChange && onSearchChange({ city: e.target.value });
  };

  // Search button → navigate to /properties with all current filters applied
  const handleSearch = () => {
    const query = (searchQuery || '').trim();
    const tabParams = TAB_PARAMS[activeTab] || { operation: 'buy' };
    const params = new URLSearchParams();

    if (query) {
      params.set('search', query);
    } else {
      params.set('city', 'Pune');
    }

    if (tabParams.operation)    params.set('operation',    tabParams.operation);
    if (tabParams.propertyType) params.set('propertyType', tabParams.propertyType);

    // Sub-type from pill filter (only when no category propertyType already set)
    let ptype = '';
    if (propertyFilter === 'Flat / Apartment') ptype = 'flat';
    else if (propertyFilter === 'Plot / Land')  ptype = 'plot';
    else if (propertyFilter === 'Independent house') ptype = 'house';
    else if (propertyFilter === 'Villas')       ptype = 'villa';
    if (ptype && !tabParams.propertyType) params.set('type', ptype);

    navigate(`/properties?${params.toString()}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMegaMenu = (tab, e) => {
    e.stopPropagation();
    // For BUY/Rent/Sell top-bar: also update activeTab
    onSearchChange && onSearchChange({ tab: tab.toUpperCase() });
    setActiveMegaMenu(prev => prev === tab ? null : tab);
  };

  return (
    <section className="hero-section" ref={megaMenuRef}>
      <div className="hero-overlay"></div>

      {/* Top Navigation Tabs (Buy, Rent, Sell) */}
      <div className="hero-top-tabs-container" style={{
        position: 'absolute',
        top: '-24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        <div className="hero-top-tabs">
          {mainTabs.map((tab, index) => (
            <React.Fragment key={tab}>
              <span
                className={`top-tab-btn ${activeTab === tab.toUpperCase() ? 'active' : ''}`}
                onClick={(e) => toggleMegaMenu(tab, e)}
              >
                {tab} <FaChevronDown className="tab-chevron" />
              </span>
              {index < mainTabs.length - 1 && <div className="tab-separator"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Mega Menus */}
        <div style={{ position: 'relative' }}>
          {activeMegaMenu === 'BUY' && (
            <div className="hero-mega-menu" style={{ top: '10px' }}>
              <div className="menu-column">
                <h4 className="menu-col-title">Properties by Type</h4>
                <ul>
                  <li onClick={() => navigate('/properties?type=flat')}>Flat / Apartments</li>
                  <li onClick={() => navigate('/properties?type=house')}>House / Villas</li>
                  <li onClick={() => navigate('/properties?type=plot')}>Plots / Land</li>
                  <li onClick={() => navigate('/properties?type=commercial')}>Commercial</li>
                  <li onClick={() => navigate('/properties?type=other')}>Others</li>
                </ul>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-column">
                <h4 className="menu-col-title">Properties by budget</h4>
                <ul>
                  <li onClick={() => navigate('/properties?budget=under50')}>Under 50 lakh</li>
                  <li onClick={() => navigate('/properties?budget=50to80')}>50 lakh - 80 lakh</li>
                  <li onClick={() => navigate('/properties?budget=1cr-to-5cr')}>1 crore - 5 crore</li>
                  <li onClick={() => navigate('/properties?budget=luxury')}>Luxury Homes</li>
                  <li onClick={() => navigate('/properties?budget=other')}>Others</li>
                </ul>
              </div>
            </div>
          )}
          {activeMegaMenu === 'Rent' && (
            <div className="hero-mega-menu x-wide-menu" style={{ top: '10px' }}>
              <div className="menu-column">
                <h4 className="menu-col-title">Properties by Type</h4>
                <ul>
                  <li onClick={() => navigate('/properties?type=apartment&operation=rent')}>Apartments for Rent</li>
                  <li onClick={() => navigate('/properties?type=house&operation=rent')}>Individual Houses</li>
                  <li onClick={() => navigate('/properties?type=pg&operation=rent')}>PG/Co-Living Spaces</li>
                  <li onClick={() => navigate('/properties?type=commercial&operation=rent')}>Commercial Rentals</li>
                </ul>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-column">
                <h4 className="menu-col-title">Quick Searches</h4>
                <ul>
                  <li onClick={() => navigate('/properties?furnished=yes&operation=rent')}>Furnished Apartments</li>
                  <li onClick={() => navigate('/properties?furnished=semi&operation=rent')}>Semi-Furnished</li>
                  <li onClick={() => navigate('/properties?owner=true&operation=rent')}>Rental Homes by Owner</li>
                  <li onClick={() => navigate('/properties?possession=immediate&operation=rent')}>Immediate Possession</li>
                </ul>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-column">
                <h4 className="menu-col-title">Popular Location</h4>
                <ul>
                  <li onClick={() => navigate('/properties?city=Mumbai&operation=rent')}>Rent in Mumbai</li>
                  <li onClick={() => navigate('/properties?city=Bangalore&operation=rent')}>Rent in Bangalore</li>
                  <li onClick={() => navigate('/properties?city=Delhi&operation=rent')}>Rent in Delhi</li>
                  <li onClick={() => navigate('/properties?city=Pune&operation=rent')}>Rent in Pune</li>
                </ul>
              </div>
            </div>
          )}
          {activeMegaMenu === 'Sell' && (
            <div className="hero-mega-menu" style={{ top: '10px' }}>
              <div className="menu-column">
                <h4 className="menu-col-title">Tools For you</h4>
                <ul>
                  <li onClick={() => navigate('/post-property')}>Post Property (Free)</li>
                  <li onClick={() => navigate('/properties')}>Check Property Valuation</li>
                  <li onClick={() => navigate('/properties')}>Find an Agent Near Me</li>
                  <li onClick={() => navigate('/properties')}>Advice / Guide / Tips</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container hero-container">
        {/* Search Card */}
        <div className="search-card">
          {/* First Row: Property Type Buttons and Post Property */}
          <div className="search-nav">
            <div className="property-types-list">
              {propertyTypes.map((item) => (
                <button
                  key={item}
                  className={`nav-btn ${activeTab === item ? 'active' : ''}`}
                  onClick={() => handleTabClick(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="search-post-link-wrapper">
              <button className="nav-btn post-link-btn" onClick={() => navigate('/post-property')}>
                Post Property
              </button>
              <span className="free-badge-mini">FREE</span>
            </div>
          </div>

          {/* Second Row: All Flats Dropdown, Search Input, and Search Button */}
          <div className="search-bar-row">
            <div style={{ position: 'relative' }}>
              <div
                className="all-flats-pill"
                onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setActiveMegaMenu(null); }}
              >
                <span className="pill-text">
                  <FaChevronDown className={`pill-chevron ${isFilterOpen ? 'rotated' : ''}`} /> {propertyFilter || 'All Flat'}
                </span>
              </div>

              {/* Dropdown Menu for All Flats */}
              {isFilterOpen && (
                <div className="filter-dropdown">
                  <ul>
                    <li onClick={() => handleFilterSelect('Flat / Apartment')}>Flat / Apartment</li>
                    <li onClick={() => handleFilterSelect('Plot / Land')}>Plot / Land</li>
                    <li onClick={() => handleFilterSelect('Independent house')}>Independent house</li>
                    <li onClick={() => handleFilterSelect('Villas')}>Villas</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="search-input-box">
              <input
                type="text"
                placeholder={SEARCH_PLACEHOLDER[activeTab] || 'Search property in your location'}
                className="search-input-field"
                value={searchQuery || ''}
                onChange={handleCityChange}
                onKeyDown={handleSearchKeyDown}
              />
            </div>

            <button className="search-action-btn" onClick={handleSearch}>
              <FaSearch className="search-icon-small" /> Search
            </button>
          </div>
        </div>

        <button
          className="search-by-map-btn"
          onClick={() => navigate('/properties?viewMode=map')}
          style={{
            position: 'absolute',
            right: '-140px',
            bottom: '36px',
            background: 'white',
            border: '1.5px solid #e5e5e5',
            borderRadius: '999px',
            padding: '8px 18px',
            color: '#0a0a0a',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0a0a0a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0a0a0a'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
        >
          🗺️ Search by map
        </button>
      </div>
    </section>
  );
};

export default HeroSection;