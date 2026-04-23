import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaHeart, FaRegHeart, FaShareAlt, FaBalanceScale,
  FaMapMarkerAlt, FaCheckCircle, FaPhone, FaEnvelope, FaShieldAlt, FaStar,
  FaChevronLeft, FaChevronRight,
  FaBookmark, FaRegBookmark, FaFileAlt
} from 'react-icons/fa';
import axios from 'axios';
import { API_PROPERTIES, API_NEWS, API_CONTACTS, API_OFFERS } from '../api/config';
import './PropertyDetails.css';

// Fallback mock data so the page always renders
const MOCK_PROPERTY = {
  _id: 'mock-1',
  title: 'Siddhi vinayak Residency',
  description:
    'This magnificent 3 BHK apartment offers an exceptional living experience in the heart of Baben, Lokhanda, Pune. With 890 sqft of thoughtfully designed space, this property features premium fittings, modern architecture, and world class amenities. The apartment comes with excellent ventilation, natural lighting, and stunning views. Perfect for families looking for comfort and convenience in a prime location.',
  price: 4500000,
  priceType: 'sale',
  propertyType: 'flat',
  constructionStatus: 'Ready To Move',
  postedBy: 'Owner',
  isVerified: true,
  bhkTypes: ['2 BHK', '3 BHK', '4 BHK'],
  address: {
    locality: 'Baben, Lokhanda',
    city: 'Pune',
    state: 'Maharashtra',
  },
  details: {
    bedrooms: 2,
    bathrooms: 2,
    area: 890,
    areaUnit: 'sqft',
    parking: 1,
    furnished: 'semi_furnished',
    floor: '3rd',
    totalFloors: 10,
  },
  amenities: [
    'Swimming Pool', 'Gym', 'Club House', 'Children Play Area',
    'Security', 'Power Backup', 'Lift', 'Garden', 'Intercom', 'CCTV'
  ],
  images: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  ],
  agentContact: {
    name: 'Rajesh Varma ~',
    phone: '+91 ••••••••••',
    company: 'Self',
    rating: 4.8,
  },
  featured: true,
  trending: true,
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({ offerPrice: '', paymentType: 'loan', closingDate: '' });
  const [offerStatus, setOfferStatus] = useState({ loading: false, success: false });

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_PROPERTIES}/${id}`);
        setProperty(res.data);
      } catch {
        setProperty(MOCK_PROPERTY);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);





  const formatPrice = (price) => {
    if (!price) return 'Price on Request';
    if (price >= 10000000) return `Rs ${(price / 10000000).toFixed(2)}`;
    if (price >= 100000) return `Rs ${(price / 100000).toFixed(0)}`;
    return `Rs ${price.toLocaleString()}`;
  };

  const formatPriceLabel = (price) => {
    if (!price) return '';
    if (price >= 10000000) return 'Crore Ownwords';
    if (price >= 100000) return 'Lakhs Ownwords';
    return '';
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.phone) { alert('Please enter phone number'); return; }
    setContactLoading(true);
    try {
      await axios.post(API_CONTACTS, {
        ...contactForm,
        propertyId: property?._id,
        agentName: property?.agentContact?.name,
      });
      setContactSubmitted(true);
    } catch {
      setContactSubmitted(true);
    } finally {
      setContactLoading(false);
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('mp_user');
    if (!storedUser) {
      alert('Please login to make an offer');
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setOfferStatus({ loading: true, success: false });

    const currentId = property?._id || id;
    if (currentId && currentId.length < 24) {
      setTimeout(() => {
        setOfferStatus({ loading: false, success: true });
        setTimeout(() => setShowOfferModal(false), 2000);
      }, 800);
      return;
    }

    try {
      await axios.post(API_OFFERS, {
        buyer: user.id || user._id,
        propertyId: currentId,
        offerPrice: offerForm.offerPrice,
        paymentType: offerForm.paymentType,
        closingDate: offerForm.closingDate,
        buyerName: user.name,
        buyerPhone: user.phone
      });
      setOfferStatus({ loading: false, success: true });
      setTimeout(() => setShowOfferModal(false), 2000);
    } catch (err) {
      setOfferStatus({ loading: false, success: false });
      alert('Failed to send offer. Please try again.');
    }
  };

  const prevImage = () => setActiveImage((i) => (i === 0 ? (property?.images?.length || 5) - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i + 1) % (property?.images?.length || 5));

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  const p = property || MOCK_PROPERTY;
  const allImages = p.images || MOCK_PROPERTY.images;
  const thumbImages = allImages.slice(0, 5);

  return (
    <div className="pd-page">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb-bar">
        <div className="pd-container">
          <Link to="/">Home</Link>
          <span> › </span>
          <Link to="/properties">Properties</Link>
          <span> › </span>
          <span className="pd-bc-current">{p.title}</span>
        </div>
      </div>

      <div className="pd-container pd-main-grid">
        {/* ===== LEFT COLUMN ===== */}
        <div className="pd-left">

          {/* Image Gallery — main left + 2x2 grid right */}
          <div className="pd-gallery">
            {p.isVerified && (
              <div className="pd-verified-badge">
                <FaCheckCircle /> RERA Verified
              </div>
            )}
            <div className="pd-gallery-layout">
              {/* Main image */}
              <div className="pd-main-image-wrapper">
                <img
                  src={allImages[activeImage] || MOCK_PROPERTY.images[0]}
                  alt={p.title}
                  className="pd-main-image"
                />
                <button className="pd-gallery-nav pd-gallery-prev" onClick={prevImage}>
                  <FaChevronLeft />
                </button>
                <button className="pd-gallery-nav pd-gallery-next" onClick={nextImage}>
                  <FaChevronRight />
                </button>
              </div>
              {/* Thumbnail grid (2×2) on the right */}
              <div className="pd-thumb-grid">
                {thumbImages.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className={`pd-thumb-cell ${activeImage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx + 1)}
                  >
                    <img src={img} alt={`view-${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Title Row */}
          <div className="pd-title-row">
            <div className="pd-title-left">
              <h1 className="pd-property-title">{p.title}</h1>
              <div className="pd-location">
                <FaMapMarkerAlt />
                <span>{p.address?.locality}, {p.address?.city}</span>
              </div>
            </div>
            <div className="pd-price-block">
              <div className="pd-price">Rs {formatPrice(p.price)}</div>
              <div className="pd-price-label">Lakhs Ownwords</div>
            </div>
          </div>

          {/* Specs Grid — 4x2 Grid of cards */}
          <div className="pd-specs-grid">
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/bed.png" alt="Bed" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Bedrooms</span>
                <span className="pd-spec-val">{p.details?.bedrooms || 5}</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/bathroom.png" alt="Bath" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Bathrooms</span>
                <span className="pd-spec-val">{p.details?.bathrooms || 6.5}</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/ruler.png" alt="Area" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Square Feet</span>
                <span className="pd-spec-val">{p.details?.area || 7850}</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/car.png" alt="Parking" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Parking</span>
                <span className="pd-spec-val">{p.details?.parking || 3} Cars</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/calendar.png" alt="Year" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Year Built</span>
                <span className="pd-spec-val">2022</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/home.png" alt="Type" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Property Type</span>
                <span className="pd-spec-val">Villa</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/mountain.png" alt="Lot" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Lot Size</span>
                <span className="pd-spec-val">0.75 Acres</span>
              </div>
            </div>
            <div className="pd-spec-card">
              <div className="pd-spec-icon"><img src="https://img.icons8.com/ios/50/000000/tag.png" alt="Status" /></div>
              <div className="pd-spec-info">
                <span className="pd-spec-label">Status</span>
                <span className="pd-spec-val">For Sale</span>
              </div>
            </div>
          </div>

          <div className="pd-description-section">
            <p><strong>Description:</strong> There are places where the soul blooms and your dreams soar, there are destinations where the heart is at peace and each day filled with infinite possibilities. This one of its kind 4 BHK independent villa for sale is situated in the prime location of Andal in Durgapur. The villa is a part of the Mtm Silver City township, ensuring a luxurious living style for you and your family. With all great facilities and amenities this independent villa is up for sale in Andal. The possession date of this residence is Dec '27. This dec '27 villa with all modern amenities is priced at ₹76.8 Lac.</p>
          </div>

          {/* Bottom Action Buttons (Tabs-like but styled as buttons) */}
          <div className="pd-bottom-actions">
            <button className={`pd-action-btn ${activeTab === 'amenities' ? 'active' : ''}`} onClick={() => setActiveTab('amenities')}>Aminites</button>
            <button className={`pd-action-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`pd-action-btn ${activeTab === 'builder' ? 'active' : ''}`} onClick={() => setActiveTab('builder')}>Dealer</button>
          </div>

          {/* Tab Content (Conditional display based on activeTab) */}
          <div className="pd-tab-content-simple">
            {activeTab === 'amenities' && (
              <div className="pd-amenities">
                <h2 className="section-title">Amenities & Features</h2>
                <div className="pd-amenities-grid">
                  {(p.amenities || MOCK_PROPERTY.amenities).map((amenity, i) => (
                    <div key={i} className="pd-amenity-item">
                      <FaCheckCircle className="pd-amenity-icon" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'builder' && (
              <div className="pd-builder">
                <h2 className="section-title">Builder / Developer Details</h2>
                <div className="pd-builder-card">
                  <div className="pd-builder-avatar">{(p.agentContact?.name || 'R')[0]}</div>
                  <div className="pd-builder-info">
                    <h3>{p.agentContact?.name || 'Rajesh Varma'}</h3>
                    <p>{p.agentContact?.company || 'Self Listed'}</p>
                    <div className="pd-builder-rating">
                      <FaStar style={{ color: '#f59e0b' }} />
                      <span>{p.agentContact?.rating || '4.8'} / 5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="pd-right">

          {/* Property Dealer Card */}
          <div className="pd-contact-card">
            <div className="pd-dealer-header">
              <div className="pd-dealer-label">Property Dealer</div>
              <div className="pd-dealer-name">{p.agentContact?.name || 'Rajesh Varma ~'}  {p.agentContact?.phone || '+91 ••••••••••'}</div>
            </div>

            <button
              className="pd-get-contact-btn"
              onClick={() => setShowPhoneModal(true)}
            >
              Get Contact /Phone Number
            </button>

            {showPhoneModal && (
              <div className="pd-phone-reveal">
                <FaShieldAlt className="pd-shield-icon" />
                <span>Phone: <strong>+91 98765 43210</strong></span>
              </div>
            )}
          </div>

          {/* Contact Agent Form */}
          <div className="pd-contact-form-card">
            <h3 className="pd-form-title">Contact Agent</h3>

            {contactSubmitted ? (
              <div className="pd-contact-success">
                <FaCheckCircle style={{ color: '#22c55e', fontSize: '2rem' }} />
                <p>Your request has been submitted! The agent will contact you soon.</p>
                <button className="pd-reset-btn" onClick={() => setContactSubmitted(false)}>Submit Another</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="pd-contact-form">
                <input
                  type="text"
                  placeholder="Name"
                  className="pd-form-input"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Phone no"
                  className="pd-form-input"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="pd-form-input"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
                <textarea
                  placeholder="Message (Optional)"
                  className="pd-form-input pd-form-textarea"
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
                <button type="submit" className="pd-request-btn" disabled={contactLoading}>
                  {contactLoading ? 'Sending...' : 'Request Callback'}
                </button>
                <button type="button" className="pd-schedule-btn" onClick={() => alert('Scheduling system coming soon!')}>
                  Schedule a visit
                </button>
                <div className="pd-contact-alt-btns">
                  <a href={`mailto:${p.agentContact?.email || 'contact@manyprop.com'}`} className="pd-alt-btn">
                    Email
                  </a>
                  <button type="button" className="pd-alt-btn pd-brochure" onClick={() => alert('Brochure download coming soon!')}>
                    Brochure
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Share / Save / Compare — icon buttons */}
          <div className="pd-sidebar-actions">
            <button className="pd-sidebar-action-btn" onClick={async () => {
              const shareData = { title: p.title, text: `Check out this property: ${p.title} in ${p.address?.city}`, url: window.location.href };
              try {
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard! Share it with anyone.');
                }
              } catch (err) {
                try {
                  const el = document.createElement('input');
                  el.value = window.location.href;
                  document.body.appendChild(el);
                  el.select();
                  document.execCommand('copy');
                  document.body.removeChild(el);
                  alert('Link copied to clipboard!');
                } catch {}
              }
            }}>
              <FaShareAlt className="pd-sidebar-action-icon" />
              <span>Share</span>
            </button>
            <button className={`pd-sidebar-action-btn ${saved ? 'saved' : ''}`} onClick={() => setSaved(!saved)}>
              {saved ? <FaBookmark className="pd-sidebar-action-icon" /> : <FaRegBookmark className="pd-sidebar-action-icon" />}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button className="pd-sidebar-action-btn" onClick={(e) => {
              e.stopPropagation();
              try {
                const list = JSON.parse(localStorage.getItem('manyprop_compare')) || [];
                const exists = list.some(item => (item._id || item.id) === (p._id || p.id));
                if (!exists && list.length < 3) {
                  list.push(p);
                  localStorage.setItem('manyprop_compare', JSON.stringify(list));
                  alert('Added to compare!');
                } else if (exists) {
                  alert('Already in compare list');
                } else {
                  alert('Max 3 properties can be compared');
                }
              } catch (err) { }
              navigate('/compare');
            }}>
              <FaBalanceScale className="pd-sidebar-action-icon" />
              <span>Compare</span>
            </button>
          </div>

          {/* Related Property Summary Card */}
          <div className="pd-related-card">
            <div className="pd-related-img">
              <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80" alt="Related" />
            </div>
            <div className="pd-related-info">
              <h4 className="pd-related-title">2 BHK 890 Sq-ft Flat</h4>
              <p className="pd-related-price">3,68,750 per sq.yards</p>
              <p className="pd-related-emi">EMI starts from 15k/month</p>
              <div className="pd-related-status">
                <span className="status-label">Status !</span>
                <span className="status-val">Ready To Move</span>
              </div>
              <button className="pd-view-details-btn" onClick={() => navigate('/properties')}>View Details</button>
            </div>
          </div>


        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="pd-offer-modal-overlay">
          <div className="pd-offer-modal">
            <button className="pd-offer-modal-close" onClick={() => setShowOfferModal(false)}>×</button>
            <h2 className="pd-offer-modal-title">Make an Instant Offer</h2>
            <p className="pd-offer-modal-sub">Submit your price and terms to the owner directly.</p>

            {offerStatus.success ? (
              <div className="pd-offer-success">
                <FaCheckCircle className="pd-offer-success-icon" />
                <h3>Offer Sent Successfully!</h3>
                <p>The owner has been notified and will respond via your dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handleOfferSubmit} className="pd-offer-form">
                <div className="pd-offer-field">
                  <label>Your Offer Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7200000"
                    value={offerForm.offerPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, offerPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="pd-offer-field">
                  <label>Payment Type</label>
                  <select
                    value={offerForm.paymentType}
                    onChange={(e) => setOfferForm({ ...offerForm, paymentType: e.target.value })}
                  >
                    <option value="loan">Home Loan</option>
                    <option value="cash">Cash Payment</option>
                  </select>
                </div>
                <div className="pd-offer-field">
                  <label>Expected Closing Date</label>
                  <input
                    type="date"
                    value={offerForm.closingDate}
                    onChange={(e) => setOfferForm({ ...offerForm, closingDate: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="pd-offer-submit-btn" disabled={offerStatus.loading}>
                  {offerStatus.loading ? 'Sending Offer...' : 'Submit Official Offer'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;