import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import './Header.css';

// Popular cities shown by default in the dropdown grid
const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
];

// All Indian states + UTs for search
const ALL_LOCATIONS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  // Major metros / cities included for convenience
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Kochi',
  'Coimbatore', 'Guwahati', 'Mysore', 'Patna', 'Ranchi', 'Bhubaneswar',
].filter((v, i, a) => a.indexOf(v) === i).sort();

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Derive the displayed location from the URL (search or city param)
  const currentSearch = searchParams.get('search') || searchParams.get('city') || 'Kolkata';
  const [selectedCity, setSelectedCity] = useState(currentSearch);

  // Keep label in sync whenever URL changes (e.g. user searches from hero or properties page)
  useEffect(() => {
    const fromUrl = searchParams.get('search') || searchParams.get('city');
    if (fromUrl) setSelectedCity(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const storedUser = localStorage.getItem('mp_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Listen for storage changes (e.g. another tab or component updates localStorage)
    const handleStorageChange = () => {
      const u = localStorage.getItem('mp_user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', handleStorageChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setSearchCity('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Re-check user on every render to catch login/logout within the same tab
  useEffect(() => {
    const interval = setInterval(() => {
      const u = localStorage.getItem('mp_user');
      const currentUser = u ? JSON.parse(u) : null;
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('mp_user');
    localStorage.removeItem('mp_token');
    setUser(null);
    setActiveDropdown(null);
    navigate('/');
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
    if (activeDropdown === menu) setSearchCity('');
  };

  const handleLocationSelect = (loc) => {
    setSelectedCity(loc);
    setActiveDropdown(null);
    setSearchCity('');
    navigate(`/properties?search=${encodeURIComponent(loc)}&type=buy`);
  };

  // Decide which list to show
  // If the user has typed something → filter ALL_LOCATIONS
  // If nothing typed → show POPULAR_CITIES
  const filteredLocations = searchCity.trim()
    ? ALL_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(searchCity.toLowerCase())
      )
    : POPULAR_CITIES;

  return (
    <header className="header" ref={dropdownRef}>
      <div className="container">
        <div className="header-content">

          {/* Left Section - Location & Support */}
          <div className="header-left">
            <div className="nav-item">
              <div className="location-section" onClick={() => toggleDropdown('LOCATION')}>
                <FaMapMarkerAlt className="location-icon" />
                <span className="location-text" style={{ textTransform: 'capitalize' }}>{selectedCity}</span>
                <FaChevronDown className={`chevron-icon ${activeDropdown === 'LOCATION' ? 'rotate' : ''}`} />
              </div>

              {activeDropdown === 'LOCATION' && (
                <div className="mega-menu location-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-title">Select City or State</div>

                  <div className="city-search-container">
                    <input
                      type="text"
                      className="city-search-input"
                      placeholder="Search any city or state in India..."
                      value={searchCity}
                      autoFocus
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                  </div>

                  {!searchCity.trim() && (
                    <div className="dropdown-section-label">Popular Cities</div>
                  )}
                  {searchCity.trim() && filteredLocations.length === 0 && (
                    <div className="no-results-msg">No locations found</div>
                  )}

                  <div className="city-grid">
                    {filteredLocations.map(loc => (
                      <div
                        key={loc}
                        className={`city-item ${selectedCity === loc ? 'active' : ''}`}
                        onClick={() => handleLocationSelect(loc)}
                      >
                        {loc}
                      </div>
                    ))}
                  </div>


                </div>
              )}
            </div>

            <div className="nav-item">
              <span className="help-text" onClick={() => toggleDropdown('SUPPORT')}>
                Help & Support <FaChevronDown style={{ fontSize: '0.65rem', marginLeft: '3px' }} />
              </span>

              {activeDropdown === 'SUPPORT' && (
                <div className="mega-menu support-menu">
                  <div className="support-menu-top">
                    <span className="support-menu-label">Toll free no</span>
                    <span className="support-menu-info">+91 9854698542</span>
                    <span className="support-menu-label">Email Id</span>
                    <span className="support-menu-info email">manypropind@gmail.com</span>
                  </div>
                  <div className="support-menu-bottom">
                    <a href="#report">Report a Listing</a>
                    <a href="#policy">Policy / Term & Condition</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Logo */}
          <Link to="/" className="logo">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Dark rounded square background */}
              <rect width="44" height="44" rx="10" fill="#111111"/>
              {/* Bold M lettermark */}
              <text
                x="22"
                y="32"
                textAnchor="middle"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight="900"
                fontSize="28"
                fill="white"
                letterSpacing="-1"
              >M</text>
            </svg>
            <span className="logo-text">MANYPROP</span>
          </Link>


          {/* Right Section */}
          <div className="header-right">
            <div className="auth-section">
              {user ? (
                <div className="nav-item" style={{ position: 'relative' }}>
                  <div className="profile-btn-nav" onClick={() => toggleDropdown('PROFILE')} title="My Profile" style={{ padding: user.profile?.avatar ? '0' : undefined, overflow: 'hidden' }}>
                    {user.profile?.avatar ? (
                      <img src={user.profile.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  {activeDropdown === 'PROFILE' && (
                    <div className="mega-menu support-menu" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{user.name || 'User'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{user.phone || user.email}</div>
                      </div>
                      <div className="support-menu-bottom">
                        <a href="/profile" style={{ textDecoration: 'none' }}>My Profile</a>
                        <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#0a0a0a', fontWeight: 'bold' }}>Logout</a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-btn">Login</Link>
              )}
              <Link to="/post-property" className="post-property-btn">
                Post Property <span className="free-badge">FREE</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;