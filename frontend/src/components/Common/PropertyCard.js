import React, { useState, useEffect } from 'react';
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaBed, FaBath, FaCar, FaDumbbell, FaWarehouse } from 'react-icons/fa';
import { MdBalcony, MdElevator, MdFitnessCenter, MdPool } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONTACTS } from '../../api/config';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [compared, setCompared] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mp_saved') || '[]');
      if (saved.find(p => p._id === property?._id || p.id === property?.id)) setWishlisted(true);
      const comp = JSON.parse(localStorage.getItem('mp_compare') || '[]');
      if (comp.find(p => p._id === property?._id || p.id === property?.id)) setCompared(true);
    } catch (e) { }
  }, [property]);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.bhk-link')) return;
    const propId = property?._id || property?.id || 'mock-1';
    navigate(`/properties/${propId}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    try {
      let saved = JSON.parse(localStorage.getItem('mp_saved') || '[]');
      if (wishlisted) {
        saved = saved.filter(p => (p._id || p.id) !== (property?._id || property?.id));
      } else {
        if (!saved.find(p => (p._id || p.id) === (property?._id || property?.id))) saved.push(property);
      }
      localStorage.setItem('mp_saved', JSON.stringify(saved));
      setWishlisted(!wishlisted);
    } catch { }
  };

  const handleContact = (e) => {
    e.stopPropagation();
    setShowContactModal(true);
  };

  const submitContact = async () => {
    if (!contactPhone) { alert('Please enter phone number'); return; }
    try {
      await axios.post(API_CONTACTS, {
        phone: contactPhone,
        propertyId: property?._id || property?.id,
        agentName: property?.agentContact?.name || 'Owner',
      });
    } catch { }
    setContactSent(true);
    setTimeout(() => { setShowContactModal(false); setContactSent(false); setContactPhone(''); }, 2000);
  };

  const priceMain = property?.price >= 10000000
    ? `Rs ${(property.price / 10000000).toFixed(1)}`
    : property?.price >= 100000
      ? `Rs ${(property.price / 100000).toFixed(0)}`
      : `Rs ${property?.price || 45}`;

  const priceSub = property?.price >= 10000000 ? 'Crore Onwards' : 'Lakhs Onwards';

  const statusLabel = property?.constructionStatus || 'Ready To Move';
  const isReadyToMove = statusLabel === 'Ready To Move';

  return (
    <>
      <div className="pc-card" onClick={handleCardClick}>
        {/* Image */}
        <div className="pc-img-wrap">
          <img
            src={property?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'}
            alt={property?.title}
          />
          {/* Badge top-left */}
          {property?.constructionStatus && (
            <span className={`pc-badge ${isReadyToMove ? 'pc-badge--green' : 'pc-badge--dark'}`}>
              {statusLabel}
            </span>
          )}
          {/* Wishlist top-right */}
          <button className="pc-heart" onClick={handleWishlist}>
            {wishlisted ? <FaHeart style={{ color: '#e85c27' }} /> : <FaRegHeart />}
          </button>
        </div>

        {/* Info */}
        <div className="pc-info">
          {/* Title + location */}
          <h3 className="pc-title">{property?.title || 'Siddhi Vinayak Residency'}</h3>
          <p className="pc-sub">
            {(property?.details?.bedrooms || 2)} BHK, {property?.propertyType || 'Flat'}
          </p>
          <div className="pc-loc">
            <FaMapMarkerAlt />
            <span>{property?.address?.locality || 'Baben, Lokhanda'}, {property?.address?.city || 'Pune'}</span>
          </div>

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price-main">{priceMain}</span>
            <span className="pc-price-sub">{priceSub}</span>
            <span className="pc-size">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>
              {property?.details?.area || 1500} sqft
            </span>
          </div>

          {/* Specs icons */}
          <div className="pc-specs">
            <div className="pc-spec-item">
              <FaBed className="pc-spec-icon" />
              <span>Bed</span>
            </div>
            <div className="pc-spec-divider" />
            <div className="pc-spec-item">
              <FaBath className="pc-spec-icon" />
              <span>Bath</span>
            </div>
            <div className="pc-spec-divider" />
            <div className="pc-spec-item">
              <FaCar className="pc-spec-icon" />
              <span>Parking</span>
            </div>
            <div className="pc-spec-divider" />
            <div className="pc-spec-item">
              <MdFitnessCenter className="pc-spec-icon" />
              <span>GYM</span>
            </div>
            <div className="pc-spec-divider" />
            <div className="pc-spec-item">
              <MdElevator className="pc-spec-icon" />
              <span>Lift</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pc-footer">
            <span className="pc-agent">
              By <strong>{property?.agentContact?.name || 'BS Group'}</strong>
            </span>
            <span className="pc-posted-by">{property?.postedBy || 'Owner'}</span>
            <div className="pc-footer-btns">
              <button className="pc-compare-btn" onClick={(e) => { e.stopPropagation(); navigate('/compare'); }}>
                Compare
              </button>
              <button className="pc-contact-btn" onClick={handleContact}>
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setShowContactModal(false)}>×</button>
            {contactSent ? (
              <div className="contact-modal-success">
                <div className="contact-success-icon">✓</div>
                <p>Request sent! Agent will contact you soon.</p>
              </div>
            ) : (
              <>
                <h3>Contact Agent</h3>
                <p className="contact-modal-sub">Leave your number and the agent will call you back.</p>
                <input
                  type="tel"
                  placeholder="+91 Phone number"
                  className="contact-modal-input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  autoFocus
                />
                <button className="contact-modal-submit" onClick={submitContact}>
                  Request Callback
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;