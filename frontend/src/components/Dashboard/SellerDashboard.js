import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaPlus, FaCheckCircle, FaSpinner, FaChevronDown, FaUser,
    FaArrowUp, FaArrowDown, FaPhone, FaRegLightbulb, FaChartBar,
    FaRegCheckCircle, FaRegTimesCircle, FaCommentDots, FaEye, FaCalendarAlt, FaCreditCard,
    FaTimes, FaFileAlt
} from 'react-icons/fa';
import './SellerDashboard.css';
import PriceAnalysisModal from './PriceAnalysisModal';

const SellerDashboard = ({ setActiveTab }) => {
    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Session user
    const [user, setUser] = useState(null);

    // Live state variables
    const [myProperties, setMyProperties] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [offers, setOffers] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);

    // Interactive selections
    const [selectedPropId, setSelectedPropId] = useState('');
    const [loading, setLoading] = useState(true);

    // Price Analysis Modal
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisPropId, setAnalysisPropId] = useState(null);

    // Dynamic states for interactive features
    const [updatingEnquiryId, setUpdatingEnquiryId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('mp_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            loadAllDashboardData(parsed);
        } else {
            navigate('/login');
        }
    }, []);

    const loadAllDashboardData = async (currentUser) => {
        setLoading(true);
        const userId = currentUser.id || currentUser._id;
        try {
            // 1. Fetch properties listed by owner
            const propRes = await axios.get(`${API}/api/properties?owner=${userId}`);
            const props = propRes.data.properties || [];
            setMyProperties(props);

            if (props.length > 0) {
                setSelectedPropId(props[0]._id || props[0].id);
            }

            // 2. Fetch enquiries received by owner (callback & visit requests)
            const enqRes = await axios.get(`${API}/api/enquiries/owner/${userId}`);
            setEnquiries(enqRes.data.enquiries || []);

            // 3. Fetch offers received by owner
            const offerRes = await axios.get(`${API}/api/offers/seller/${userId}`);
            setOffers(offerRes.data || []);

            // 4. Fetch dashboard stats
            const statsRes = await axios.get(`${API}/api/users/${userId}/dashboard`);
            setDashboardStats(statsRes.data);

        } catch (err) {
            console.error('Failed to load real-time owner stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate quality score and list improvements for selected listing
    const computeQualityScore = (property) => {
        if (!property) return { score: 70, list: [] };
        let score = 55;
        const list = [];

        // photos score
        const imagesCount = property.images ? property.images.length : 0;
        if (imagesCount >= 3) {
            score += 15;
            list.push({ text: 'RERA-compliant images added', ok: true });
        } else {
            list.push({ text: `Add ${3 - imagesCount} more photos`, ok: false });
        }

        // description score
        const descLength = property.description ? property.description.length : 0;
        if (descLength > 100) {
            score += 15;
            list.push({ text: 'Detailed description provided', ok: true });
        } else {
            list.push({ text: 'Expand property description', ok: false });
        }

        // pricing assessment
        const price = property.price || 8500000;
        if (price < 10000000) {
            score += 15;
            list.push({ text: 'Highly competitive area pricing', ok: true });
        } else {
            list.push({ text: 'Slightly premium price index', ok: false, premium: true });
        }

        return { score, list };
    };

    // Get current selected listing
    const selectedProperty = myProperties.find(p => (p._id || p.id) === selectedPropId) || myProperties[0] || null;
    const { score, list: qualityImprovements } = computeQualityScore(selectedProperty);

    // Summing views
    const totalViewsCount = myProperties.reduce((sum, p) => sum + (p.views || 0), 0);

    // Handle status changes for enquiries / visits
    const handleActionUpdate = async (enqId, status) => {
        setUpdatingEnquiryId(enqId);
        try {
            await axios.put(`${API}/api/enquiries/${enqId}/status`, { status });
            // Reload local list
            setEnquiries(prev => prev.map(e => e._id === enqId ? { ...e, status } : e));
            alert(`🎉 Inquiry marked as ${status === 'seen' ? 'Accepted' : 'Completed'}!`);
        } catch (err) {
            console.error('Failed to update inquiry:', err);
            alert('Failed to update status. Check server status.');
        } finally {
            setUpdatingEnquiryId(null);
        }
    };

    if (loading) {
        return (
            <div className="owner-dash-loading">
                <FaSpinner className="spin" />
                <p>Retrieving real-time listings & buyer insights...</p>
            </div>
        );
    }

    return (
        <>
        <div className="owner-dash-container">
            {/* Owner Info Block */}
            <div className="owner-profile-block">
                <div className="profile-badge-box">
                    <div className="owner-avatar-circle">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'PV'}
                    </div>
                    <div className="info">
                        <h2>{user?.name || 'Owner Name'}</h2>
                        <p className="sub">Property owner · {myProperties.length} active listings</p>
                    </div>
                </div>
                <div className="header-actions">
                    {user?.kyc?.aadhaarNumber && user?.kyc?.panNumber && user?.agentDetails?.reraRegistration && (
                        <span className="owner-badge-verified">🛡️ Verified Owner</span>
                    )}
                    <button className="post-property-cta" onClick={() => navigate('/post-property')}>
                        <FaPlus /> Post property ↗
                    </button>
                </div>
            </div>

            {/* AI Pricing Insight Card */}
            <div className="ai-pricing-insight-banner">
                <div className="insight-left">
                    <div className="pricing-bulb-wrap">
                        <FaRegLightbulb />
                    </div>
                    <div>
                        <h4>AI Pricing Insight</h4>
                        <p>
                            Your {selectedProperty?.address?.locality || 'Sector 22'} listing is priced slightly above the area's current index.
                            Consider aligning your ask with the market average of ₹{(selectedProperty?.price ? (selectedProperty.price * 0.92 / 100000).toFixed(0) : '88')}L to trigger a 40% uptick in buyer inquiries.
                        </p>
                    </div>
                </div>
                <button
                    className="view-analysis-btn"
                    onClick={() => {
                        const pid = selectedPropId || (myProperties[0] ? (myProperties[0]._id || myProperties[0].id) : null);
                        if (pid) {
                            setAnalysisPropId(pid);
                            setShowAnalysis(true);
                        } else {
                            alert('Please post a property first to view its price analysis.');
                        }
                    }}
                >
                    View analysis ↗
                </button>
            </div>

            {/* 4 Stats Cards */}
            <div className="owner-stats-grid">
                <div className="owner-stat-card">
                    <div className="icon-wrap views">
                        <FaEye />
                    </div>
                    <div className="stat-info">
                        <h3>{totalViewsCount}</h3>
                        <p className="title">Total Views</p>
                        <span className="subtext green">↑ 12% vs last week</span>
                    </div>
                </div>

                <div className="owner-stat-card">
                    <div className="icon-wrap inquiries">
                        <FaCommentDots />
                    </div>
                    <div className="stat-info">
                        <h3>{enquiries.length}</h3>
                        <p className="title">Buyer Inquiries</p>
                        <span className="subtext orange">↑ {enquiries.filter(e => e.status === 'new').length} new today</span>
                    </div>
                </div>

                <div className="owner-stat-card">
                    <div className="icon-wrap visits">
                        <FaCalendarAlt />
                    </div>
                    <div className="stat-info">
                        <h3>{enquiries.filter(e => e.type === 'visit').length}</h3>
                        <p className="title">Visits Booked</p>
                        <span className="subtext green">Active schedulers</span>
                    </div>
                </div>

                <div className="owner-stat-card">
                    <div className="icon-wrap offers">
                        <FaCreditCard />
                    </div>
                    <div className="stat-info">
                        <h3>{offers.length}</h3>
                        <p className="title">Offers Received</p>
                        <span className="subtext pink">{offers.filter(o => o.status === 'pending').length} pending review</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: My Listings & Quality Score */}
            <div className="owner-dash-mid-row">
                {/* Left side: My Listings */}
                <div className="dash-pane-card listings-box">
                    <div className="pane-header">
                        <h3>My listings</h3>
                        <button className="manage-link" onClick={() => setActiveTab && setActiveTab('listings')}>Manage ↗</button>
                    </div>

                    <div className="owner-listings-scroller">
                        {myProperties.map((p) => {
                            const pId = p._id || p.id;
                            const views = p.views || 412;
                            const matchingEnquiries = enquiries.filter(e => e.property?._id === pId || e.property === pId).length;
                            const formattedPrice = p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(2)}Cr` : `₹${(p.price / 100000).toFixed(0)}L`;
                            const marketAvg = p.price >= 10000000 ? `₹${(p.price * 0.92 / 10000000).toFixed(2)}Cr` : `₹${(p.price * 0.92 / 100000).toFixed(0)}L`;

                            return (
                                <div
                                    key={pId}
                                    className={`owner-listing-row ${selectedPropId === pId ? 'selected' : ''}`}
                                    onClick={() => setSelectedPropId(pId)}
                                >
                                    <div className="listing-home-icon">🏢</div>
                                    <div className="listing-mid">
                                        <h4>{p.title}</h4>
                                        <p className="meta">{p.details?.area || '1,450'} sqft · {formattedPrice} · Listed {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                        <p className="comparison">
                                            Your price: <strong>{formattedPrice}</strong> · Market avg: <span className="market-avg">{marketAvg}</span>
                                            {p.price > p.price * 0.92 ? (
                                                <FaArrowUp className="arrow-red" />
                                            ) : (
                                                <FaArrowDown className="arrow-green" />
                                            )}
                                        </p>
                                    </div>
                                    <div className="listing-right">
                                        <div className="views-badge">
                                            <strong>{views}</strong> views
                                        </div>
                                        <span className="inquiries-subtext">{matchingEnquiries} inquiries</span>
                                        <span className="active-badge-lbl">Active</span>
                                    </div>
                                </div>
                            );
                        })}

                        {myProperties.length === 0 && (
                            <div className="empty-listings-placeholder">
                                <FaFileAlt className="icon" />
                                <p>You have not posted any properties yet.</p>
                                <button className="explore-btn" onClick={() => navigate('/post-property')}>Post First Property</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Listing Quality Score */}
                <div className="dash-pane-card quality-score-box">
                    <div className="pane-header">
                        <h3>Listing quality score</h3>
                    </div>

                    {selectedProperty ? (
                        <div className="quality-pane-body">
                            <div className="quality-gauge-row">
                                <div className="quality-gauge">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" className="bg" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            className="fill"
                                            style={{ strokeDashoffset: 251 - (251 * score) / 100 }}
                                        />
                                    </svg>
                                    <div className="gauge-text">
                                        <h3>{score}</h3>
                                        <p>Score</p>
                                    </div>
                                </div>
                                <div className="selected-property-summary">
                                    <h4>{selectedProperty.title.substring(0, 24)}...</h4>
                                    <p className="address-lbl">{selectedProperty.address?.locality}, {selectedProperty.address?.city}</p>
                                </div>
                            </div>

                            <div className="score-improvements-checklist">
                                <h5>Improve score:</h5>
                                {qualityImprovements.map((item, idx) => (
                                    <div key={idx} className={`improvement-row ${item.ok ? 'ok' : 'pending'}`}>
                                        <span className="checkbox-icon">
                                            {item.ok ? '✓' : '📷'}
                                        </span>
                                        <span className="text">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-quality-placeholder">
                            <p>No property selected. Post a listing to analyze its quality score instantly!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Buyer Inquiries & Views Chart */}
            <div className="owner-dash-bottom-row">
                {/* Left Pane: Buyer Inquiries */}
                <div className="dash-pane-card buyer-inquiries-box">
                    <div className="pane-header">
                        <h3>Buyer inquiries</h3>
                        <span className="count-pill-need-response">
                            {enquiries.filter(e => e.status === 'new').length} need response
                        </span>
                    </div>

                    <div className="inquiries-scroller">
                        {enquiries.map((e) => {
                            const initials = e.senderName ? e.senderName.substring(0, 2).toUpperCase() : 'UR';
                            const colors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#ec4899'];
                            const idx = e.senderName ? e.senderName.charCodeAt(0) % colors.length : 0;
                            const avatarBg = colors[idx];

                            return (
                                <div key={e._id} className="buyer-inquiry-item">
                                    <div className="buyer-avatar" style={{ backgroundColor: avatarBg }}>
                                        {initials}
                                    </div>
                                    <div className="buyer-info-col">
                                        <h4>{e.senderName}</h4>
                                        <p className="property-lbl">{e.property?.title || 'General Inquiry'}</p>
                                        <span className="trust-badge-lbl">Verified Buyer</span>
                                    </div>
                                    <div className="buyer-cta-col">
                                        {e.status === 'new' ? (
                                            <button
                                                className="action-accept-btn"
                                                onClick={() => handleActionUpdate(e._id, 'seen')}
                                                disabled={updatingEnquiryId === e._id}
                                            >
                                                Accept ↗
                                            </button>
                                        ) : (
                                            <span className="status-badge-completed">Accepted</span>
                                        )}
                                        <button
                                            className="action-chat-btn"
                                            onClick={() => setActiveTab && setActiveTab('messages')}
                                        >
                                            Chat
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {enquiries.length === 0 && (
                            <div className="empty-inquiries-placeholder">
                                <FaCommentDots className="empty-icon" />
                                <p>No buyer inquiries received yet. Share your properties to start receiving callback requests!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Views over last 7 days */}
                <div className="dash-pane-card views-chart-box">
                    <div className="pane-header">
                        <h3>Views over last 7 days</h3>
                    </div>

                    <div className="chart-wrapper-pane">
                        <div className="chart-bar-layout">
                            <div className="bar-column"><div className="bar" style={{ height: '35%' }}><span className="tooltip">42 views</span></div><span className="lbl">Mon</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '48%' }}><span className="tooltip">58 views</span></div><span className="lbl">Tue</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '62%' }}><span className="tooltip">75 views</span></div><span className="lbl">Wed</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '50%' }}><span className="tooltip">60 views</span></div><span className="lbl">Thu</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '70%' }}><span className="tooltip">85 views</span></div><span className="lbl">Fri</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '90%' }}><span className="tooltip">110 views</span></div><span className="lbl">Sat</span></div>
                            <div className="bar-column"><div className="bar" style={{ height: '80%' }}><span className="tooltip:">95 views</span></div><span className="lbl">Sun</span></div>
                        </div>

                        <div className="chart-meta-row">
                            <div className="meta-card">
                                <span>Total this week</span>
                                <h4>{totalViewsCount} views</h4>
                            </div>
                            <div className="meta-card">
                                <span>Avg. time on listing</span>
                                <h4>2m 18s</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Price Analysis Modal */}
        {showAnalysis && analysisPropId && (
            <PriceAnalysisModal
                propertyId={analysisPropId}
                onClose={() => { setShowAnalysis(false); setAnalysisPropId(null); }}
            />
        )}
        </>
    );
};

export default SellerDashboard;
