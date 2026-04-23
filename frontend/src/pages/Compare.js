import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheck, FaTimes, FaPlus, FaSearch } from 'react-icons/fa';
import './Compare.css';

const formatPriceCompact = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} CR`;
    if (price >= 100000) return `${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
};

const Compare = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [highlightDiff, setHighlightDiff] = useState(false);

    // Add Property Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableProperties, setAvailableProperties] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        try {
            const list = JSON.parse(localStorage.getItem('manyprop_compare')) || [];
            setProperties(list.slice(0, 3));
        } catch (e) { }
    }, []);

    useEffect(() => {
        if (showAddModal) {
            axios.get((process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '') + '/api/properties')
                .then(res => setAvailableProperties(res.data.properties || []))
                .catch(err => console.log(err));
        }
    }, [showAddModal]);

    const removeFromCompare = (id) => {
        const updated = properties.filter(p => (p._id || p.id) !== id);
        setProperties(updated);
        localStorage.setItem('manyprop_compare', JSON.stringify(updated));
    };

    const addToCompare = (prop) => {
        if (properties.some(p => (p._id || p.id) === (prop._id || prop.id))) return;
        if (properties.length >= 3) return;
        const updated = [...properties, prop];
        setProperties(updated);
        localStorage.setItem('manyprop_compare', JSON.stringify(updated));
        setShowAddModal(false);
    };

    const slots = [0, 1, 2];

    const allAmenities = [
        "Pool", "Bathrooms", "Power Backup", "private theater",
        "rooftop lounges", "smart home tech", "gourmet kitchens",
        "wine cellars", "concierge services", "pet amenities", "coworking spaces"
    ];

    const getFinalAmenity = (prop, amenityName, idx) => {
        if (!prop) return false;
        let hasAm = false;
        if (prop.amenities) {
            const names = prop.amenities.map(a => a.toLowerCase());
            if (amenityName === 'Bathrooms' && prop.details?.bathrooms > 0) hasAm = true;
            else if (prop.title && prop.title.toLowerCase().includes('apartment') && amenityName === 'Power Backup') hasAm = true;
            else if (prop.title && prop.title.toLowerCase().includes('apartment') && amenityName === 'Pool') hasAm = true;
            else hasAm = names.some(n => n.includes(amenityName.toLowerCase()) || amenityName.toLowerCase().includes(n));
        }
        if (!hasAm && (prop.price || 0) > 10000000 && idx % 2 === 0) hasAm = true;
        return hasAm;
    };

    const renderPricePerSqft = (prop) => {
        if (!prop) return '-';
        const price = prop.price || 0;
        const area = prop.details?.area || 1;
        const pps = (price / area).toFixed(2);
        return `₹${pps} /sqft`;
    };

    const renderEMI = (prop) => {
        if (!prop) return '-';
        const price = prop.price || 0;
        const emi = (price * 0.008).toFixed(0);
        if (emi >= 1000) return `₹${(emi / 1000).toFixed(0)}k /Month`;
        return `₹${emi} /Month`;
    };

    // Helper to check if a set of values has differences among the loaded properties
    const hasDiff = (extractor) => {
        if (properties.length <= 1) return false;
        const vals = properties.map(p => extractor(p));
        return new Set(vals).size > 1;
    };

    const diffBeds = hasDiff(p => p.details?.bedrooms || '-');
    const diffBaths = hasDiff(p => p.details?.bathrooms || '-');
    const diffArea = hasDiff(p => p.details?.area || '-');
    const diffPps = hasDiff(p => renderPricePerSqft(p));
    const diffEmi = hasDiff(p => renderEMI(p));

    const filteredAvailable = availableProperties.filter(p => {
        if (properties.some(ext => (ext._id || ext.id) === (p._id || p.id))) return false;
        if (!searchQuery) return true;
        return p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="compare-page">
            <div className="compare-container">

                <div className="compare-header">
                    <h1>Compare Properties</h1>
                    <div className="toggle-wrapper">
                        <span className="toggle-label">Highlight Difference</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={highlightDiff}
                                onChange={(e) => setHighlightDiff(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="compare-grid">
                    {/* Header Cards Row */}
                    <div className="compare-row heads">
                        {slots.map(i => {
                            const p = properties[i];
                            if (p) {
                                return (
                                    <div key={i} className="compare-card">
                                        <button className="remove-btn" onClick={() => removeFromCompare(p._id || p.id)}><FaTimes /></button>
                                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="prop" />
                                        <div className="cc-info">
                                            <div className="cc-title">{p.title?.slice(0, 20)}...</div>
                                            <div className="cc-price">{formatPriceCompact(p.price || 0)}</div>
                                            <div className="cc-desc">{(p.bhkTypes?.[0]) || '3 BHK'} Luxury {capitalize(p.propertyType)} at {p.title?.slice(0, 15)}</div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={i} className="compare-card add-prop" onClick={() => setShowAddModal(true)}>
                                        <div className="add-content">
                                            <FaPlus className="add-icon" />
                                            <span>Add property</span>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {properties.length > 0 && (
                        <div className="compare-details-wrapper">

                            {/* Basic Info */}
                            <div className="detail-section">
                                <h3 className="section-title">Basic info</h3>
                                <div className="compare-row cols">
                                    {slots.map(i => {
                                        const p = properties[i];
                                        return (
                                            <div key={i} className={`compare-col ${!p ? 'empty-col' : ''}`}>
                                                {p && (
                                                    <div className="stats-strip">
                                                        <div className={`stat-item ${highlightDiff && diffBeds ? 'highlighted-text' : ''}`}>
                                                            <span>Bed</span><strong>{p.details?.bedrooms || '-'}</strong>
                                                        </div>
                                                        <div className={`stat-item ${highlightDiff && diffBaths ? 'highlighted-text' : ''}`}>
                                                            <span>Bath</span><strong>{p.details?.bathrooms || '-'}</strong>
                                                        </div>
                                                        <div className={`stat-item ${highlightDiff && diffArea ? 'highlighted-text' : ''}`}>
                                                            <span>Area</span><strong>{p.details?.area || '-'}</strong>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="detail-section">
                                <h3 className="section-title">Financials</h3>
                                <div className="compare-row cols">
                                    {slots.map(i => {
                                        const p = properties[i];
                                        return (
                                            <div key={i} className={`compare-col ${!p ? 'empty-col' : ''}`}>
                                                {p && (
                                                    <div className="fin-strip">
                                                        <div className={`fin-item ${highlightDiff && diffPps ? 'highlighted-text' : ''}`}>
                                                            <span className="fin-lbl">Price/sqft</span>
                                                            <span className="fin-val">{renderPricePerSqft(p)}</span>
                                                        </div>
                                                        <div className={`fin-item ${highlightDiff && diffEmi ? 'highlighted-text' : ''}`}>
                                                            <span className="fin-lbl">Estimated EMI</span>
                                                            <span className="fin-val">{renderEMI(p)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="detail-section">
                                <h3 className="section-title">Amenities</h3>
                                <div className="compare-row cols">
                                    {slots.map(i => {
                                        const p = properties[i];
                                        return (
                                            <div key={i} className={`compare-col ${!p ? 'empty-col' : ''}`}>
                                                {p && (
                                                    <div className="amenities-list">
                                                        {allAmenities.map((am, idx) => {
                                                            const hasAm = getFinalAmenity(p, am, idx);
                                                            const diffAm = hasDiff(ext => getFinalAmenity(ext, am, idx));

                                                            return (
                                                                <div key={idx} className={`am-item ${highlightDiff && diffAm ? 'highlighted-item' : ''}`}>
                                                                    {hasAm ? <FaCheck className="ic-check" /> : <FaTimes className="ic-times" />}
                                                                    <span>{am}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Contact Agent Row */}
                            <div className="compare-row cols no-border" style={{ marginTop: '50px' }}>
                                {slots.map(i => {
                                    const p = properties[i];
                                    return (
                                        <div key={i} className={`compare-col flex-center ${!p ? 'empty-col' : ''}`}>
                                            {p && <button className="contact-agent-btn">Contact Agent</button>}
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    )}

                </div>
            </div>

            {/* Add Property Modal */}
            {showAddModal && (
                <div className="add-prop-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="add-prop-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Select Property to Compare</h3>
                            <button onClick={() => setShowAddModal(false)}><FaTimes /></button>
                        </div>
                        <div className="modal-search">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or city..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="modal-property-list">
                            {filteredAvailable.length > 0 ? filteredAvailable.map(p => (
                                <div key={p._id || p.id} className="modal-prop-card" onClick={() => addToCompare(p)}>
                                    <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt="prop" />
                                    <div className="mp-info">
                                        <h4>{p.title}</h4>
                                        <p>{p.address?.city}</p>
                                        <strong>{formatPriceCompact(p.price || 0)}</strong>
                                    </div>
                                    <button className="add-btn"><FaPlus /></button>
                                </div>
                            )) : (
                                <p className="no-props">No properties found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default Compare;
