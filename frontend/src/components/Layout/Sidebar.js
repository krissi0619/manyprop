import React from 'react';
import { FaPhone, FaEnvelope, FaSearch } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const supportInfo = {
    tollFree: '+91 9854685542',
    email: 'manyprop@gmail.com',
  };

  const locations = [
    'Mumbai', 'Kolkata', 'Gurgaon', 'Bhubaneswar', 'Cuttack',
    'Pune', 'Thane', 'Dadri'
  ];

  const propertyTypes = [
    'Flat / Apartment',
    'Plot / Land',
    'Independent house',
    'Villas'
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Support Help Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Support help</h3>
          <div className="support-info">
            <div className="support-item">
              <span className="support-label">Toll free no</span>
              <div className="support-contact">
                <FaPhone className="contact-icon" />
                <span>{supportInfo.tollFree}</span>
              </div>
            </div>
            <div className="support-item">
              <span className="support-label">Email Id</span>
              <div className="support-contact">
                <FaEnvelope className="contact-icon" />
                <span>{supportInfo.email}</span>
              </div>
            </div>
            <div className="support-links">
              <a href="#report" className="support-link">Report a Listing</a>
              <a href="#policy" className="support-link">Policy / Term & Conditions</a>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Location</h3>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search location"
              className="location-search"
            />
          </div>
          <div className="location-list">
            {locations.map((location, index) => (
              <div key={index} className="location-item">
                <span>{location}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All Flat Section */}
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">All Flat</h3>
          <div className="sidebar-property-types">
            {propertyTypes.map((type, index) => (
              <div key={index} className="property-type-item">
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;