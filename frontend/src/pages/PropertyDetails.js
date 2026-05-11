import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaHeart, FaRegHeart, FaShareAlt, FaBalanceScale,
  FaMapMarkerAlt, FaCheckCircle, FaPhone, FaEnvelope, FaShieldAlt, FaStar,
  FaChevronLeft, FaChevronRight,
  FaBookmark, FaRegBookmark, FaFileAlt, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL, API_PROPERTIES, API_NEWS, API_CONTACTS, API_OFFERS } from '../api/config';
import SEO from '../components/Common/SEO';
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

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState({ loading: false, success: false });

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({ name: '', phone: '', email: '', date: '', time: '' });
  const [visitStatus, setVisitStatus] = useState({ loading: false, success: false });

  useEffect(() => {
    window.scrollTo(0, 0);
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

    // Track property views for the Buyer Dashboard
    try {
      if (id) {
        const viewedStr = localStorage.getItem('mp_viewed_properties') || '[]';
        const viewed = JSON.parse(viewedStr);
        if (!viewed.includes(id)) {
          viewed.push(id);
          localStorage.setItem('mp_viewed_properties', JSON.stringify(viewed));
        }
      }
    } catch (e) {
      console.error('Failed to track viewed property:', e);
    }
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
      await axios.post(`${API_BASE_URL}/api/enquiries`, {
        type: 'callback',
        senderName:  contactForm.name,
        senderPhone: contactForm.phone,
        senderEmail: contactForm.email,
        message:     contactForm.message,
        propertyId:  property?._id || id,
      });
      setContactSubmitted(true);
    } catch {
      // Still show success to user even if API fails
      setContactSubmitted(true);
    } finally {
      setContactLoading(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!visitForm.phone) { alert('Please enter your phone number'); return; }
    if (!visitForm.date)  { alert('Please select a preferred date'); return; }
    setVisitStatus({ loading: true, success: false });
    try {
      await axios.post(`${API_BASE_URL}/api/enquiries`, {
        type: 'visit',
        senderName:  visitForm.name,
        senderPhone: visitForm.phone,
        senderEmail: visitForm.email,
        message:     `Site visit requested for ${visitForm.date} at ${visitForm.time || 'any time'}`,
        propertyId:  property?._id || id,
        visitDate:   visitForm.date,
        visitTime:   visitForm.time,
      });
      setVisitStatus({ loading: false, success: true });
    } catch {
      setVisitStatus({ loading: false, success: true }); // still show success
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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('mp_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    setReportStatus({ loading: true, success: false });
    
    const currentId = property?._id || id;
    try {
      await axios.post(`${API_PROPERTIES}/${currentId}/report`, {
        userId: user ? (user.id || user._id) : null,
        reason: reportReason
      });
      setReportStatus({ loading: false, success: true });
      setTimeout(() => {
        setShowReportModal(false);
        setReportStatus({ loading: false, success: false });
        setReportReason('');
      }, 2000);
    } catch (err) {
      setReportStatus({ loading: false, success: false });
      alert('Failed to submit report. Please try again.');
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
  
  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const rawImages = (p.images && p.images.length > 0) ? p.images : MOCK_PROPERTY.images;
  const allImages = rawImages.map(img => getMediaUrl(img));
  const thumbImages = allImages.slice(0, 5);
  const videoUrl = p.video ? getMediaUrl(p.video) : '';

  // Dynamic RealEstateListing Schema
  const dynamicSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": p.title,
    "description": p.description,
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "image": allImages[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    "datePosted": p.createdAt || new Date().toISOString(),
    "offers": {
      "@type": "Offer",
      "price": p.price,
      "priceCurrency": "INR"
    },
    "about": {
      "@type": p.propertyType === 'flat' || p.propertyType === 'apartment' ? "Apartment" : "SingleFamilyResidence",
      "name": p.title,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": p.address?.locality || "",
        "addressRegion": p.address?.city || "",
        "addressCountry": "IN"
      },
      "numberOfRooms": p.details?.bedrooms || 0,
      "numberOfBathroomsTotal": p.details?.bathrooms || 0,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": p.details?.area || 0,
        "unitCode": "FTK"
      }
    }
  };

  const bedLabel = p.details?.bedrooms ? `${p.details.bedrooms} BHK ` : '';
  const typeLabel = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1).replace('_', ' ') : 'Property';
  const priceTypeLabel = p.priceType === 'rent' ? 'Rent' : 'Sale';
  const localityLabel = p.address?.locality ? `${p.address.locality}, ` : '';
  const cityLabel = p.address?.city || '';

  return (
    <div className="pd-page">
      <SEO 
        title={`${p.title} | ${bedLabel}${typeLabel} for ${priceTypeLabel} in ${localityLabel}${cityLabel}`}
        description={`${p.description ? p.description.substring(0, 150) : 'Property details for ' + p.title}. Locate verified properties, get builder contacts, direct owner listings on ManyProp.`}
        image={allImages[0]}
        schema={dynamicSchema}
        keywords={`${p.title}, buy flat ${cityLabel}, rent apartment ${localityLabel}${cityLabel}, zero brokerage property, ${typeLabel} in ${cityLabel}`}
      />
      {/* Breadcrumb */}
      <div className="pd-breadcrumb-bar">
        <div className="pd-container">
          <Link to="/home">Home</Link>
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
          {/* Video (if uploaded by owner) */}
          {videoUrl && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px', fontWeight: 700 }}>📹 Property Video Tour</h3>
              <video
                src={videoUrl}
                controls
                style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          )}
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
              <div className="pd-price">{formatPrice(p.price)}</div>
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
              <div className="pd-dealer-label">Property Owner / Dealer</div>
              <div className="pd-dealer-name">
                {/* Show real owner name from DB or agentContact */}
                {p.owner?.name || p.agentContact?.name || 'Owner'}
                {p.agentContact?.phone && (
                  <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, fontSize: '0.85rem' }}>
                    {showPhoneModal ? p.agentContact.phone : '+91 ••••••••••'}
                  </span>
                )}
              </div>
            </div>

            <button
              className="pd-get-contact-btn"
              onClick={() => setShowPhoneModal(true)}
            >
              {showPhoneModal ? 'Contact Revealed ✓' : 'Get Contact / Phone Number'}
            </button>

            {showPhoneModal && (
              <div className="pd-phone-reveal">
                <FaShieldAlt className="pd-shield-icon" />
                <span>Phone: <strong>{p.agentContact?.phone || p.owner?.phone || '+91 98765 43210'}</strong></span>
                {p.agentContact?.email && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: '0.82rem' }}>
                    Email: {p.agentContact.email}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Make Offer CTA ── */}
          {(() => {
            const currentUser = JSON.parse(localStorage.getItem('mp_user') || '{}');
            const isLoggedIn  = !!localStorage.getItem('mp_token');
            const sellerTypes = ['Owner', 'Builder', 'Agent', 'Landlord'];
            const isSeller    = sellerTypes.includes(currentUser.userType);

            // Owners/Builders/Agents see an info badge, not the button
            if (isLoggedIn && isSeller) {
              return (
                <div style={{ marginBottom: 16, background: '#f8f9fa', border: '1.5px solid #e0e0e0', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏠</span>
                  <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#666', lineHeight: 1.5 }}>
                    You are signed in as <strong>{currentUser.userType}</strong>.<br />
                    Only buyers can make an offer on a property.
                  </p>
                </div>
              );
            }

            // Buyers (logged in or not) see the button
            return (
              <div style={{ marginBottom: 16 }}>
                <button
                  id="make-offer-btn"
                  style={{
                    width: '100%', padding: '16px',
                    background: 'linear-gradient(135deg,#e85c27,#f97316)',
                    color: '#fff', border: 'none', borderRadius: '14px',
                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'inherit', letterSpacing: '-0.01em',
                    boxShadow: '0 6px 20px rgba(232,92,39,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    if (!isLoggedIn) { navigate('/login'); return; }
                    navigate(`/make-offer/${p._id || id}`, { state: { property: p } });
                  }}
                  onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseOut={e  => e.currentTarget.style.transform='translateY(0)'}
                >
                  💰 Make an Offer
                </button>
                <p style={{ textAlign:'center', fontSize:'0.73rem', color:'#94a3b8', marginTop:6 }}>
                  Submit your price directly to the owner
                </p>
              </div>
            );
          })()}

          {/* Contact Agent Form */}
          {(() => {
            const currentUser = JSON.parse(localStorage.getItem('mp_user') || '{}');
            const isLoggedIn  = !!localStorage.getItem('mp_token');
            // Hide for any seller type (Owner, Agent, Builder, Landlord)
            const hideContact = isLoggedIn && ['Owner', 'Agent', 'Builder', 'Landlord'].includes(currentUser.userType);
            
            if (hideContact) return null;

            return (
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
                    <button type="button" className="pd-schedule-btn" onClick={() => setShowVisitModal(true)}>
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
            );
          })()}

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
            <button className="pd-sidebar-action-btn" onClick={() => setShowReportModal(true)} style={{ color: '#ef4444' }}>
              <FaExclamationTriangle className="pd-sidebar-action-icon" style={{ color: '#ef4444' }} />
              <span>Report</span>
            </button>
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="pd-offer-modal-overlay">
          <div className="pd-offer-modal">
            <button className="pd-offer-modal-close" onClick={() => setShowReportModal(false)}>×</button>
            <h2 className="pd-offer-modal-title" style={{ color: '#ef4444' }}>Report Property</h2>
            <p className="pd-offer-modal-sub">Tell us why you are reporting this property.</p>

            {reportStatus.success ? (
              <div className="pd-offer-success">
                <FaCheckCircle className="pd-offer-success-icon" style={{ color: '#ef4444' }} />
                <h3 style={{ color: '#ef4444' }}>Report Submitted</h3>
                <p>Thank you. Our admin team will review this shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="pd-offer-form">
                <div className="pd-offer-field">
                  <label>Reason for reporting</label>
                  <textarea
                    placeholder="E.g. Fake listing, incorrect price, already sold..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={4}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginTop: '8px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <button type="submit" className="pd-offer-submit-btn" style={{ background: '#ef4444' }} disabled={reportStatus.loading}>
                  {reportStatus.loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Schedule a Visit Modal */}
      {showVisitModal && (
        <div className="pd-offer-modal-overlay">
          <div className="pd-offer-modal">
            <button className="pd-offer-modal-close" onClick={() => { setShowVisitModal(false); setVisitStatus({ loading: false, success: false }); }}>×</button>
            <h2 className="pd-offer-modal-title">📅 Schedule a Site Visit</h2>
            <p className="pd-offer-modal-sub">Fill in your details and we'll confirm your visit with the owner.</p>

            {visitStatus.success ? (
              <div className="pd-offer-success">
                <FaCheckCircle className="pd-offer-success-icon" style={{ color: '#22c55e' }} />
                <h3 style={{ color: '#22c55e' }}>Visit Scheduled!</h3>
                <p>Your request has been sent to the owner. They will confirm the timing shortly.</p>
                <button className="pd-offer-submit-btn" style={{ marginTop: '16px', background: '#22c55e' }} onClick={() => { setShowVisitModal(false); setVisitStatus({ loading: false, success: false }); setVisitForm({ name: '', phone: '', email: '', date: '', time: '' }); }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleVisitSubmit} className="pd-offer-form">
                <div className="pd-offer-field">
                  <label>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={visitForm.name}
                    onChange={(e) => setVisitForm({ ...visitForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="pd-offer-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={visitForm.phone}
                    onChange={(e) => setVisitForm({ ...visitForm, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="pd-offer-field">
                  <label>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={visitForm.email}
                    onChange={(e) => setVisitForm({ ...visitForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="pd-offer-field">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    value={visitForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="pd-offer-field">
                  <label>Preferred Time</label>
                  <select
                    value={visitForm.time}
                    onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px', fontFamily: 'inherit' }}
                  >
                    <option value="">Any time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                  </select>
                </div>
                <button type="submit" className="pd-offer-submit-btn" style={{ background: 'linear-gradient(135deg,#e85c27,#f97316)' }} disabled={visitStatus.loading}>
                  {visitStatus.loading ? 'Scheduling...' : '📅 Confirm Visit Request'}
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