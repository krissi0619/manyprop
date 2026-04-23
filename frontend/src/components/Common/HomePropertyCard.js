import React, { useState } from 'react';
import { FaHeart, FaMapMarkerAlt, FaRegHeart, FaRegClock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HomePropertyCard.css';
import '../Home/FeaturedProjects.css';

const HomePropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const [wishlisted, setWishlisted] = useState(false);

    const propId = property?._id || property?.id || 'mock-1';
    const price = property?.price || 7500000;
    const area = property?.details?.area || 750;
    const pricePerSqft = Math.round(price / area);
    const bhkType = property?.bhkTypes?.[0] || '3 BHK';
    const pType = property?.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'Apartment';

    return (
        <div className="project-card home-property-card-override" onClick={() => navigate(`/properties/${propId}`)}>
            <div className="project-image-container">
                <img
                    src={property?.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'}
                    alt="Property"
                    className="project-image"
                />
                <div className="project-top-left-badge">
                    Couple Friendly
                </div>
                <button className="project-wishlist" onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}>
                    {wishlisted ? <FaHeart style={{ color: '#ea580c' }} /> : <FaRegHeart style={{ color: '#ea580c' }}/>}
                </button>
            </div>

            <div className="project-content">
                <div className="project-header-row">
                    <div className="project-bhk-type">
                        <span className="bhk-text">{bhkType}</span> <span className="type-text">{pType}</span>
                    </div>
                    <div className="project-location-row">
                        <FaMapMarkerAlt className="project-location-icon" />
                        <span>{property?.address?.city || 'Noida'}, {property?.address?.state || 'New Delhi'}</span>
                    </div>
                </div>

                <div className="project-price-row">
                    <div className="price-main">₹ {(price / 100000).toFixed(0)} Lakhs</div>
                    <div className="price-sub">₹{pricePerSqft} per sqft</div>
                    <div className="price-area">{area} sqft</div>
                </div>

                <div className="project-features-badges">
                    <div className="feature-pill">RERA</div>
                    <div className="feature-pill">{property?.details?.furnished || 'Furnished'}</div>
                    <div className="feature-pill">Verified</div>
                    <div className="feature-ribbon">Ready to Move</div>
                </div>

                <div className="project-footer">
                    <button className="project-compare-btn" onClick={(e) => {
                        e.stopPropagation();
                        try {
                            const list = JSON.parse(localStorage.getItem('manyprop_compare')) || [];
                            const exists = list.some(p => (p._id || p.id) === propId);
                            if (!exists && list.length < 3) {
                                list.push(property);
                                localStorage.setItem('manyprop_compare', JSON.stringify(list));
                            }
                        } catch (err) { }
                        navigate('/compare');
                    }}>
                        Compare
                    </button>
                    <button className="project-view-btn" onClick={(e) => { e.stopPropagation(); navigate(`/properties/${propId}`); }}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePropertyCard;
