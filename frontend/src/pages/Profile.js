import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUserEdit, FaHeart, FaBalanceScale, FaBell,
    FaList, FaEnvelope, FaSignOutAlt, FaBuilding,
    FaMapMarkerAlt, FaTrash, FaEye, FaExchangeAlt, FaChartBar, FaChartLine
} from 'react-icons/fa';
import axios from 'axios';
import BuyerDashboard from '../components/Dashboard/BuyerDashboard';
import SellerDashboard from '../components/Dashboard/SellerDashboard';
import AgentDashboard from '../components/Dashboard/AgentDashboard';
import MessagesTab from '../components/Dashboard/MessagesTab';
import './Profile.css';

/* ── ProfilePropertyRow — displays one saved / compare property ── */
const ProfilePropertyRow = ({ property, onRemove, onView }) => {
    const p = property || {};
    const title = p.title || 'Unnamed Property';
    const price = p.price
        ? p.price >= 10000000
            ? `₹${(p.price / 10000000).toFixed(1)} Cr`
            : p.price >= 100000
                ? `₹${(p.price / 100000).toFixed(0)} L`
                : `₹${p.price.toLocaleString()}/mo`
        : '—';
    const location = [p.address?.locality, p.address?.city].filter(Boolean).join(', ') || 'Location not specified';
    const pType = p.propertyType
        ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1)
        : 'Property';
    const bedrooms = p.details?.bedrooms || p.bhkTypes?.[0]?.split(' ')?.[0] || null;
    const area = p.details?.area;
    const image = p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&q=60';
    const status = p.constructionStatus;

    return (
        <div className="prof-prop-row">
            <div className="prof-prop-thumb" onClick={onView}>
                <img src={image} alt={title} />
                {status && <span className="prof-prop-badge">{status}</span>}
            </div>
            <div className="prof-prop-info">
                <h4 className="prof-prop-title" onClick={onView}>{title}</h4>
                <div className="prof-prop-meta">
                    <span className="prof-prop-type">{pType}</span>
                    {bedrooms && <span className="prof-prop-spec">{bedrooms} BHK</span>}
                    {area && <span className="prof-prop-spec">{area} sqft</span>}
                </div>
                <div className="prof-prop-location">
                    <FaMapMarkerAlt style={{ fontSize: '0.72rem', color: '#ea580c', marginRight: 4 }} />
                    {location}
                </div>
                <div className="prof-prop-price">{price}</div>
            </div>
            <div className="prof-prop-actions">
                <button className="prof-prop-view-btn" onClick={onView}>
                    <FaEye style={{ marginRight: 5 }} /> View
                </button>
                <button className="prof-prop-remove-btn" onClick={onRemove}>
                    <FaTrash style={{ marginRight: 5 }} /> Remove
                </button>
            </div>
        </div>
    );
};

/* ── EnquiriesTab — shows callback/visit requests for owner or sent by buyer ── */
const EnquiriesTab = ({ user, isOwner, API }) => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const userId = user.id || user._id;
                const url = isOwner
                    ? `${API}/api/enquiries/owner/${userId}`
                    : `${API}/api/enquiries/sender/${user.phone || ''}`;
                const res = await axios.get(url);
                setEnquiries(res.data.enquiries || []);
            } catch (e) {
                console.error('Failed to fetch enquiries:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user, isOwner, API]);

    const markStatus = async (id, status) => {
        try {
            await axios.put(`${API}/api/enquiries/${id}/status`, { status });
            setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status } : e));
        } catch (e) { console.error(e); }
    };

    if (loading) return <p style={{ marginTop: 16 }}>Loading enquiries...</p>;
    if (enquiries.length === 0) return (
        <div className="empty-state">
            <FaEnvelope className="empty-icon" />
            <p>{isOwner ? 'No enquiries received yet.' : 'No enquiries submitted yet.'}</p>
        </div>
    );

    const typeLabel = { callback: '📞 Callback Request', visit: '📅 Site Visit', general: '💬 General Enquiry' };
    const statusColor = { new: '#ea580c', seen: '#2563eb', done: '#16a34a' };

    return (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {enquiries.map(enq => (
                <div key={enq._id} style={{
                    background: '#fff',
                    border: '1.5px solid #f0f0f0',
                    borderLeft: `4px solid ${statusColor[enq.status] || '#ea580c'}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '3px 10px', borderRadius: 20 }}>
                                {typeLabel[enq.type] || '💬 Enquiry'}
                            </span>
                            {enq.property?.title && (
                                <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: '1rem' }}>{enq.property.title}</p>
                            )}
                            {enq.property?.address && (
                                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#888' }}>
                                    📍 {[enq.property.address.locality, enq.property.address.city].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#aaa' }}>
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px 20px' }}>
                        <div><small style={{ color: '#888' }}>Sender</small><p style={{ margin: 0, fontWeight: 600 }}>{enq.senderName}</p></div>
                        <div><small style={{ color: '#888' }}>Phone</small><p style={{ margin: 0, fontWeight: 600 }}>{enq.senderPhone}</p></div>
                        {enq.senderEmail && <div><small style={{ color: '#888' }}>Email</small><p style={{ margin: 0, fontWeight: 600 }}>{enq.senderEmail}</p></div>}
                        {enq.type === 'visit' && enq.visitDate && (
                            <div>
                                <small style={{ color: '#888' }}>Visit Date & Time</small>
                                <p style={{ margin: 0, fontWeight: 600 }}>{enq.visitDate} {enq.visitTime && `at ${enq.visitTime}`}</p>
                            </div>
                        )}
                    </div>

                    {enq.message && (
                        <p style={{ marginTop: 10, background: '#f9f9f9', padding: '10px 14px', borderRadius: 8, fontSize: '0.88rem', color: '#444', margin: '10px 0 0' }}>
                            "{enq.message}"
                        </p>
                    )}

                    {isOwner && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: statusColor[enq.status], fontWeight: 700, border: `1px solid ${statusColor[enq.status]}`, borderRadius: 20, padding: '2px 10px' }}>
                                {enq.status.toUpperCase()}
                            </span>
                            {enq.status === 'new' && (
                                <button onClick={() => markStatus(enq._id, 'seen')} style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 20, padding: '4px 14px', cursor: 'pointer', fontWeight: 600 }}>
                                    Mark as Seen
                                </button>
                            )}
                            {enq.status !== 'done' && (
                                <button onClick={() => markStatus(enq._id, 'done')} style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 20, padding: '4px 14px', cursor: 'pointer', fontWeight: 600 }}>
                                    ✓ Mark Done
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('edit-profile');
    const [savedProps, setSavedProps] = useState([]);
    const [compareProps, setCompareProps] = useState([]);
    const [offers, setOffers] = useState([]);
    const [offerLoading, setOfferLoading] = useState(false);
    const [myProperties, setMyProperties] = useState([]);
    const [myPropsLoading, setMyPropsLoading] = useState(false);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    const [userFullData, setUserFullData] = useState(null);
    const [kycVerifyStatus, setKycVerifyStatus] = useState({});
    const [verifyingMsg, setVerifyingMsg] = useState('');
    const [reraVerifyStatus, setReraVerifyStatus] = useState('');
    const [gstVerifyStatus, setGstVerifyStatus] = useState('');
    const [urlVerifyStatus, setUrlVerifyStatus] = useState('');
    const [bizSaveMsg, setBizSaveMsg] = useState('');

    const fetchFullProfile = async (token) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserFullData(res.data);
        } catch (e) {
            console.error("Failed to fetch full profile");
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('mp_user');
        const token = localStorage.getItem('mp_token');
        if (!storedUser || !token) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
            fetchFullProfile(token);
        }

        try {
            setSavedProps(JSON.parse(localStorage.getItem('mp_saved') || '[]'));
            // Compare uses 'manyprop_compare' key (same as Compare page & PropertyDetails)
            setCompareProps(JSON.parse(localStorage.getItem('manyprop_compare') || '[]'));
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role === 'admin') {
                    setActiveTab('admin-portal');
                } else if (parsedUser.userType === 'Buyer') {
                    setActiveTab('dashboard');
                }
                fetchOffers(parsedUser);
                fetchMyProperties(parsedUser);
            }
        } catch (e) { }
    }, [navigate]);

    const fetchDashboardStats = async (currentUser) => {
        setDashboardLoading(true);
        try {
            const res = await axios.get(`${API}/api/users/${currentUser.id || currentUser._id}/dashboard`);
            setDashboardStats(res.data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        } finally {
            setDashboardLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard' && user) {
            fetchDashboardStats(user);
        }
    }, [activeTab, user]);

    const handleVerifyDoc = async (docType, docNumber) => {
        if (!docNumber) {
            alert(`Please provide ${docType} number first.`);
            return;
        }
        setVerifyingMsg(`Verifying ${docType} via Third-Party Provider...`);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/verify-document`, {
                type: docType, number: docNumber
            });
            setKycVerifyStatus(prev => ({ ...prev, [docType]: res.data.message }));
            alert(res.data.message);
        } catch(e) {
            const errMessage = e.response?.data?.message || 'Verification Failed';
            setKycVerifyStatus(prev => ({ ...prev, [docType]: errMessage }));
            alert(errMessage);
        }
        setVerifyingMsg('');
    };

    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    /* ── RERA Number verification ─────────────────────── */
    const handleVerifyRera = async (reraNum) => {
        if (!reraNum || !reraNum.trim()) {
            alert('Please enter the RERA registration number first.');
            return;
        }
        setReraVerifyStatus('verifying');
        try {
            const res = await axios.post(`${API}/api/auth/verify-document`, { type: 'rera', number: reraNum });
            if (res.data.success) {
                setReraVerifyStatus('success');
            }
        } catch (e) {
            setReraVerifyStatus('invalid');
        }
    };

    /* ── GST Number verification ─────────────────────── */
    const handleVerifyGst = async (gstNum) => {
        if (!gstNum || !gstNum.trim()) {
            alert('Please enter the GST number first.');
            return;
        }
        setGstVerifyStatus('verifying');
        try {
            const res = await axios.post(`${API}/api/auth/verify-document`, { type: 'gst', number: gstNum });
            if (res.data.success) {
                setGstVerifyStatus('success');
            }
        } catch (e) {
            setGstVerifyStatus('invalid');
        }
    };

    /* ── Company URL verification ────────────────────── */
    const handleVerifyCompanyUrl = async (url) => {
        if (!url || !url.trim()) {
            alert('Please enter your company website URL first.');
            return;
        }
        setUrlVerifyStatus('verifying');
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            if (urlObj.hostname.includes('.')) {
                await new Promise(r => setTimeout(r, 800));
                setUrlVerifyStatus('success');
            } else {
                setUrlVerifyStatus('invalid');
            }
        } catch {
            setUrlVerifyStatus('invalid');
        }
    };

    /* ── Save Business (RERA + Company URL) to backend ─ */
    const handleSaveBusinessDetails = async () => {
        const token = localStorage.getItem('mp_token');
        if (!token) return;
        const reraInput = document.getElementById('prof-rera')?.value || '';
        const urlInput = document.getElementById('prof-company-url')?.value || '';
        const cinInput = document.getElementById('prof-cin')?.value || '';
        const gstInput = document.getElementById('prof-gst')?.value || '';
        setBizSaveMsg('Saving...');
        try {
            const isBuilder = user.userType === 'Builder';
            if (isBuilder) {
                await axios.put(`${API}/api/auth/save-developer-details`, {
                    reraRegistration: reraInput,
                    companyUrl: urlInput,
                    cin: cinInput,
                }, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.put(`${API}/api/auth/save-agent-details`, {
                    reraRegistration: reraInput,
                    reraAgentLicense: reraInput,
                    gstNumber: gstInput,
                }, { headers: { Authorization: `Bearer ${token}` } });
            }
            setBizSaveMsg('✅ Business details saved successfully!');
            fetchFullProfile(token);
        } catch {
            setBizSaveMsg('❌ Failed to save. Please try again.');
        }
        setTimeout(() => setBizSaveMsg(''), 4000);
    };

    const fetchOffers = async (currentUser) => {
        setOfferLoading(true);
        try {
            const role = currentUser.role === 'agent' || currentUser.userType !== 'Buyer' ? 'seller' : 'buyer';
            const res = await axios.get(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '') + ''}/api/offers/${role}/${currentUser.id || currentUser._id}`);
            setOffers(res.data);
        } catch (err) {
            console.error('Error fetching offers:', err);
        } finally {
            setOfferLoading(false);
        }
    };

    const handleOfferAction = async (offerId, status, counterPrice = null) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '') + ''}/api/offers/${offerId}/status`, { status, counterPrice });
            fetchOffers(user);
        } catch (err) {
            alert('Failed to update offer status');
        }
    };

    const fetchMyProperties = async (currentUser) => {
        setMyPropsLoading(true);
        try {
            const res = await axios.get(`${API}/api/properties?owner=${currentUser.id || currentUser._id}`);
            setMyProperties(res.data.properties || []);
        } catch (err) {
            console.error('Failed to fetch my properties:', err);
        } finally {
            setMyPropsLoading(false);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        const token = localStorage.getItem('mp_token');
        try {
            await axios.delete(`${API}/api/properties/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyProperties(prev => prev.filter(p => p._id !== propertyId && p.id !== propertyId));
            alert("Property deleted successfully");
        } catch (err) {
            console.error("Failed to delete property:", err);
            alert("Failed to delete property");
        }
    };

    if (!user) return <div className="profile-loading">Loading...</div>;

    const isOwner = user.role === 'agent' || user.userType === 'Owner' || user.userType === 'Builder' || user.userType === 'Agent';
    const isBuilder = user.userType === 'Builder';
    const isAgent = user.role === 'agent' || user.userType === 'Agent';

    const handleLogout = () => {
        localStorage.removeItem('mp_token');
        localStorage.removeItem('mp_user');
        navigate('/');  // Go to landing page on logout
    };

    const BUYER_TABS = [
        { id: 'edit-profile', icon: <FaUserEdit />, label: 'Edit Profile' },
        { id: 'dashboard', icon: <FaChartBar />, label: 'Dashboard Stats' },
        { id: 'messages', icon: <FaEnvelope />, label: 'Messages & Chats' },
        { id: 'saved', icon: <FaHeart />, label: 'Saved Properties / Favorites' },
        { id: 'compare', icon: <FaBalanceScale />, label: 'Compare Later' },
        { id: 'alerts', icon: <FaBell />, label: 'Price Updates & Alerts' },
        { id: 'offers-sent', icon: <FaBalanceScale />, label: 'My Offers / Track' },
        { id: 'enquiries', icon: <FaEnvelope />, label: 'View Enquiries' },
    ];

    const SELLER_TABS = [
        { id: 'edit-profile', icon: <FaUserEdit />, label: 'Edit Profile' },
        { id: 'dashboard', icon: <FaChartBar />, label: 'Dashboard Stats' },
        { id: 'messages', icon: <FaEnvelope />, label: 'Messages & Chats' },
        { id: 'post-property', icon: <FaBuilding />, label: 'Post Property' },
        { id: 'listings', icon: <FaList />, label: 'Manage Listings' },
        { id: 'offers-received', icon: <FaBalanceScale />, label: 'Property Offers' },
        { id: 'enquiries', icon: <FaEnvelope />, label: 'View Enquiries' },
    ];

    let TABS = isOwner ? SELLER_TABS : BUYER_TABS;
    
    // Add Admin Portal tab if user is an admin
    if (user.role === 'admin') {
        TABS = [{ id: 'admin-portal', icon: <FaChartLine />, label: 'Admin Portal' }];
    }

    return (
        <div className="profile-page">
            <div className="profile-header-bg"></div>
            <div className="profile-container">

                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-user-info">
                        <div className="profile-avatar" style={{ padding: (userFullData?.profile?.avatar || user?.profile?.avatar) ? '0' : undefined, overflow: 'hidden' }}>
                            {userFullData?.profile?.avatar || user?.profile?.avatar ? (
                                <img src={userFullData?.profile?.avatar || user?.profile?.avatar} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        <h3>{user.name || 'User Name'}</h3>
                        <p className="user-role-badge">
                            {user.role === 'admin' ? 'Administrator' : 
                             isAgent ? 'Real Estate Agent' :
                             isBuilder ? 'Builder / Developer' :
                             isOwner ? 'Property Owner' : 'Buyer / Tenant'}
                        </p>
                        <p className="user-email">{user.email}</p>
                        <p className="user-phone">{user.phone}</p>
                    </div>

                    <div className="profile-menu">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`profile-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    if (tab.id === 'post-property') {
                                        navigate('/post-property');
                                    } else if (tab.id === 'admin-portal') {
                                        navigate('/admin/dashboard');
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                            >
                                <span className="menu-icon">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                        <button className="profile-menu-item logout-btn" onClick={handleLogout}>
                            <span className="menu-icon"><FaSignOutAlt /></span>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="profile-content">
                    {activeTab === 'admin-portal' && user.role === 'admin' && (
                        <div className="tab-pane" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Welcome, Administrator</h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>Manage the entire ManyProp platform from your dedicated dashboard.</p>
                            <button 
                                onClick={() => navigate('/admin/dashboard')}
                                style={{
                                    background: 'linear-gradient(135deg, #0a0a0a, #333)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '15px 40px',
                                    borderRadius: '999px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: '0 auto'
                                }}
                            >
                                <FaChartLine /> Launch Admin Portal
                            </button>
                        </div>
                    )}

                    {activeTab === 'edit-profile' && (
                        <div className="tab-pane">
                            <h2>Edit Profile</h2>

                            {userFullData && (!userFullData.profileComplete || !userFullData.kyc?.aadhaarNumber || !userFullData.kyc?.panNumber) && (
                                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', fontWeight: '500' }}>
                                    ⚠️ Incomplete Profile. Please update your details and verify your Aadhaar and PAN using our Third-Party Verification below.
                                </div>
                            )}

                            {verifyingMsg && (
                                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe', fontWeight: '500' }}>
                                    ⏳ {verifyingMsg}
                                </div>
                            )}

                            <div className="form-group-row">
                                <div className="form-field">
                                    <label>Full Name</label>
                                    <input type="text" defaultValue={user.name} className="profile-input" />
                                </div>
                                <div className="form-field">
                                    <label>Email Address</label>
                                    <input type="email" defaultValue={user.email} className="profile-input" disabled />
                                </div>
                            </div>
                            <div className="form-group-row">
                                <div className="form-field">
                                    <label>Phone Number</label>
                                    <input type="tel" defaultValue={user.phone} className="profile-input" />
                                </div>
                                <div className="form-field">
                                    <label>Occupation</label>
                                    <input type="text" defaultValue={userFullData?.occupation || ''} className="profile-input" />
                                </div>
                            </div>
                            
                            {/* ── KYC Section ─────────────────── */}
                            <div className="biz-section-divider">
                                <span>Identity Verification (KYC)</span>
                            </div>

                            <div className="form-group-row">
                                <div className="form-field" style={{ flex: 1 }}>
                                    <label>Aadhaar Number</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="text" id="prof-aadhaar" defaultValue={userFullData?.kyc?.aadhaarNumber || ''} className="profile-input" style={{ flex: 1 }} />
                                        <button
                                            type="button"
                                            onClick={() => handleVerifyDoc('aadhaar', document.getElementById('prof-aadhaar').value)}
                                            className="verify-btn"
                                        >Verify Online</button>
                                    </div>
                                    {kycVerifyStatus.aadhaar && <small className={kycVerifyStatus.aadhaar.includes('Successfully') ? 'verify-ok' : 'verify-fail'}>{kycVerifyStatus.aadhaar}</small>}
                                </div>
                            </div>
                            <div className="form-group-row">
                                <div className="form-field" style={{ flex: 1 }}>
                                    <label>PAN Number</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input type="text" id="prof-pan" defaultValue={userFullData?.kyc?.panNumber || ''} className="profile-input" style={{ flex: 1 }} />
                                        <button
                                            type="button"
                                            onClick={() => handleVerifyDoc('pan', document.getElementById('prof-pan').value)}
                                            className="verify-btn"
                                        >Verify Online</button>
                                    </div>
                                    {kycVerifyStatus.pan && <small className={kycVerifyStatus.pan.includes('Successfully') ? 'verify-ok' : 'verify-fail'}>{kycVerifyStatus.pan}</small>}
                                </div>
                            </div>

                            {/* ── Business Verification — Owner / Builder / Agent only ─── */}
                            {isOwner && (
                                <>
                                    <div className="biz-section-divider">
                                        <span>Business Verification {isBuilder ? '(Builder / Developer)' : '(Owner / Agent)'}</span>
                                    </div>

                                    <div className="biz-verify-card">
                                        {/* RERA Number — for ALL owners/builders/agents */}
                                        <div className="form-field">
                                            <label className="biz-label">
                                                🏛️ RERA Registration Number
                                                <span className="biz-label-hint">{isBuilder ? '(Project / Developer RERA)' : '(Agent / Broker RERA)'}</span>
                                            </label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="text"
                                                    id="prof-rera"
                                                    defaultValue={isBuilder
                                                        ? (userFullData?.developerDetails?.reraRegistration || '')
                                                        : (userFullData?.agentDetails?.reraRegistration || userFullData?.agentDetails?.reraAgentLicense || '')}
                                                    className="profile-input"
                                                    placeholder={isBuilder ? 'e.g. P52100027427' : 'e.g. A51800000168'}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    type="button"
                                                    className={`verify-btn ${reraVerifyStatus === 'success' ? 'verify-btn--success' : reraVerifyStatus === 'invalid' ? 'verify-btn--fail' : ''}`}
                                                    onClick={() => handleVerifyRera(document.getElementById('prof-rera').value)}
                                                    disabled={reraVerifyStatus === 'verifying'}
                                                >
                                                    {reraVerifyStatus === 'verifying' ? '⏳ Checking...' :
                                                     reraVerifyStatus === 'success'   ? '✅ Verified' :
                                                     reraVerifyStatus === 'invalid'   ? '❌ Invalid' :
                                                     'Verify RERA'}
                                                </button>
                                            </div>
                                            {reraVerifyStatus === 'success' && <small className="verify-ok">✅ RERA number format is valid and verified.</small>}
                                            {reraVerifyStatus === 'invalid' && <small className="verify-fail">❌ Invalid RERA format. Check the number on rera.gov.in</small>}
                                            <small className="biz-hint">You can check your RERA details at <a href="https://rera.gov.in" target="_blank" rel="noreferrer">rera.gov.in</a></small>
                                        </div>

                                        {/* GST — for agents */}
                                        {!isBuilder && (
                                            <div className="form-field" style={{ marginTop: 16 }}>
                                                <label className="biz-label">🧾 GST Number <span className="biz-label-hint">(Optional)</span></label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input
                                                        type="text"
                                                        id="prof-gst"
                                                        defaultValue={userFullData?.agentDetails?.gstNumber || ''}
                                                        className="profile-input"
                                                        placeholder="e.g. 22AAAAA0000A1Z5"
                                                        style={{ flex: 1 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`verify-btn ${gstVerifyStatus === 'success' ? 'verify-btn--success' : gstVerifyStatus === 'invalid' ? 'verify-btn--fail' : ''}`}
                                                        onClick={() => handleVerifyGst(document.getElementById('prof-gst').value)}
                                                        disabled={gstVerifyStatus === 'verifying'}
                                                    >
                                                        {gstVerifyStatus === 'verifying' ? '⏳ Checking...' :
                                                         gstVerifyStatus === 'success'   ? '✅ Verified' :
                                                         gstVerifyStatus === 'invalid'   ? '❌ Invalid' :
                                                         'Verify GST'}
                                                    </button>
                                                </div>
                                                {gstVerifyStatus === 'success' && <small className="verify-ok">✅ GSTIN format is valid and verified.</small>}
                                                {gstVerifyStatus === 'invalid' && <small className="verify-fail">❌ Invalid GSTIN format. Please enter a valid 15-character GSTIN.</small>}
                                            </div>
                                        )}

                                        {/* Company URL — Builder / Developer only */}
                                        {isBuilder && (
                                            <>
                                                <div className="form-field" style={{ marginTop: 16 }}>
                                                    <label className="biz-label">
                                                        🌐 Company Website URL
                                                        <span className="biz-label-hint">(For developer verification)</span>
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <input
                                                            type="url"
                                                            id="prof-company-url"
                                                            defaultValue={userFullData?.developerDetails?.companyUrl || ''}
                                                            className="profile-input"
                                                            placeholder="e.g. https://yourcompany.com"
                                                            style={{ flex: 1 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`verify-btn ${urlVerifyStatus === 'success' ? 'verify-btn--success' : urlVerifyStatus === 'invalid' ? 'verify-btn--fail' : ''}`}
                                                            onClick={() => handleVerifyCompanyUrl(document.getElementById('prof-company-url').value)}
                                                            disabled={urlVerifyStatus === 'verifying'}
                                                        >
                                                            {urlVerifyStatus === 'verifying' ? '⏳ Checking...' :
                                                             urlVerifyStatus === 'success'   ? '✅ Valid URL' :
                                                             urlVerifyStatus === 'invalid'   ? '❌ Invalid URL' :
                                                             'Verify URL'}
                                                        </button>
                                                    </div>
                                                    {urlVerifyStatus === 'success' && <small className="verify-ok">✅ Website URL format is valid.</small>}
                                                    {urlVerifyStatus === 'invalid' && <small className="verify-fail">❌ Please enter a valid website URL (e.g. https://company.com)</small>}
                                                </div>

                                                <div className="form-field" style={{ marginTop: 16 }}>
                                                    <label className="biz-label">🏢 CIN Number <span className="biz-label-hint">(Company Identification Number)</span></label>
                                                    <input
                                                        type="text"
                                                        id="prof-cin"
                                                        defaultValue={userFullData?.developerDetails?.cin || ''}
                                                        className="profile-input"
                                                        placeholder="e.g. U45200MH2010PTC123456"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Save button for business section */}
                                        <button
                                            className="verify-btn verify-btn--save"
                                            onClick={handleSaveBusinessDetails}
                                            style={{ marginTop: 20, width: '100%' }}
                                        >
                                            💾 Save Business Details
                                        </button>
                                        {bizSaveMsg && (
                                            <p style={{ marginTop: 10, fontSize: '0.85rem', color: bizSaveMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                                {bizSaveMsg}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <button className="btn-save-profile" style={{ marginTop: '28px' }}>Save Changes</button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        isAgent ? (
                            <AgentDashboard setActiveTab={setActiveTab} />
                        ) : isOwner ? (
                            <SellerDashboard setActiveTab={setActiveTab} />
                        ) : (
                            <BuyerDashboard setActiveTab={setActiveTab} />
                        )
                    )}

                    {activeTab === 'messages' && (
                        <MessagesTab user={user} isOwner={isOwner} />
                    )}

                    {activeTab === 'saved' && (
                        <div className="tab-pane">
                            <div className="prop-list-header">
                                <h2>Saved Properties</h2>
                                <span className="prop-list-count">{savedProps.length} saved</span>
                            </div>
                            <p>Properties you have liked and saved will appear here.</p>
                            {savedProps.length > 0 ? (
                                <div className="prof-prop-list">
                                    {savedProps.map((p, idx) => (
                                        <ProfilePropertyRow
                                            key={p._id || p.id || idx}
                                            property={p}
                                            onRemove={() => {
                                                const next = savedProps.filter((_, i) => i !== idx);
                                                setSavedProps(next);
                                                localStorage.setItem('mp_saved', JSON.stringify(next));
                                            }}
                                            onView={() => navigate(`/properties/${p._id || p.id}`)}
                                            actionLabel="Remove"
                                            actionIcon={<FaTrash />}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FaHeart className="empty-icon" />
                                    <p>No saved properties yet.</p>
                                    <button className="btn-explore" onClick={() => navigate('/properties')}>Explore Properties</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'compare' && (
                        <div className="tab-pane">
                            <div className="prop-list-header">
                                <h2>Compare Later</h2>
                                <span className="prop-list-count">{compareProps.length} / 3 properties</span>
                            </div>
                            <p>Properties added to your compare list will show up here.</p>
                            {compareProps.length > 0 ? (
                                <>
                                    <div className="prof-prop-list">
                                        {compareProps.map((p, idx) => (
                                            <ProfilePropertyRow
                                                key={p._id || p.id || idx}
                                                property={p}
                                                onRemove={() => {
                                                    const next = compareProps.filter((_, i) => i !== idx);
                                                    setCompareProps(next);
                                                    localStorage.setItem('manyprop_compare', JSON.stringify(next));
                                                }}
                                                onView={() => navigate(`/properties/${p._id || p.id}`)}
                                                actionLabel="Remove"
                                                actionIcon={<FaTrash />}
                                            />
                                        ))}
                                    </div>
                                    {compareProps.length >= 2 && (
                                        <button
                                            className="btn-compare-now"
                                            onClick={() => navigate('/compare')}
                                        >
                                            <FaExchangeAlt style={{ marginRight: 8 }} />
                                            Compare These Properties
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state">
                                    <FaBalanceScale className="empty-icon" />
                                    <p>Your compare list is empty.</p>
                                    <button className="btn-explore" onClick={() => navigate('/properties')}>Browse Properties</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="tab-pane">
                            <h2>Price Updates & Alerts</h2>
                            <p>Manage your notifications for price drops and new matching properties.</p>
                            <div className="alert-toggle-box">
                                <div>
                                    <h4>Email Notifications</h4>
                                    <p>Get notified about new projects in your interested localities.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'enquiries' && (
                        <div className="tab-pane">
                            <h2>View Enquiries</h2>
                            <p>{isOwner ? 'Callback requests and site visit bookings from buyers for your properties.' : 'Your submitted callbacks and site visit requests.'}</p>
                            <EnquiriesTab user={user} isOwner={isOwner} API={API} />
                        </div>
                    )}

                    {(activeTab === 'offers-sent' || activeTab === 'offers-received') && (
                        <div className="tab-pane">
                            <h2>{activeTab === 'offers-sent' ? 'My Sent Offers' : 'Offers Received'}</h2>
                            <p>{activeTab === 'offers-sent' ? 'Track the status of offers you made on properties.' : 'Manage financial offers received from potential buyers.'}</p>

                            {offerLoading ? <p>Loading offers...</p> : (
                                <div className="offers-list">
                                    {offers.length > 0 ? offers.map(offer => (
                                        <div key={offer._id} className="offer-card" style={{
                                            background: '#fff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            marginBottom: '15px',
                                            border: '1px solid #eee',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h4 style={{ margin: 0 }}>{offer.property?.title}</h4>
                                                <span className={`status-pill ${offer.status}`} style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    background: offer.status === 'accepted' ? '#dcfce7' : offer.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                                    color: offer.status === 'accepted' ? '#15803d' : offer.status === 'rejected' ? '#991b1b' : '#854d0e'
                                                }}>
                                                    {offer.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="offer-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                                                <div>
                                                    <small style={{ color: '#888' }}>Offer Price</small>
                                                    <p style={{ margin: '4px 0', fontWeight: '700' }}>₹{offer.offerPrice.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <small style={{ color: '#888' }}>Payment Mode</small>
                                                    <p style={{ margin: '4px 0', textTransform: 'capitalize' }}>{offer.paymentType}</p>
                                                </div>
                                                <div>
                                                    <small style={{ color: '#888' }}>Closing Date</small>
                                                    <p style={{ margin: '4px 0' }}>{new Date(offer.closingDate).toLocaleDateString()}</p>
                                                </div>
                                                {activeTab === 'offers-received' && (
                                                    <div>
                                                        <small style={{ color: '#888' }}>Buyer</small>
                                                        <p style={{ margin: '4px 0' }}>{offer.buyerName || offer.buyer?.name}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {activeTab === 'offers-received' && offer.status === 'pending' && (
                                                <div className="offer-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                    <button onClick={() => handleOfferAction(offer._id, 'accepted')} style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Accept</button>
                                                    <button onClick={() => handleOfferAction(offer._id, 'rejected')} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Reject</button>
                                                    <button onClick={() => {
                                                        const price = prompt('Enter counter offer price:');
                                                        if (price) handleOfferAction(offer._id, 'countered', price);
                                                    }} style={{ flex: 1, background: '#fff', color: '#0f172a', border: '1px solid #0f172a', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Counter</button>
                                                </div>
                                            )}

                                            {offer.status === 'countered' && offer.counterPrice && (
                                                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Counter Offer:</strong> Seller requested ₹{offer.counterPrice.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="empty-state">
                                            <FaBalanceScale className="empty-icon" />
                                            <p>No offers found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'listings' && isOwner && (
                        <div className="tab-pane">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>Manage My Listings</h2>
                                <button className="btn-explore" onClick={() => navigate('/post-property')}>+ Add Property</button>
                            </div>
                            <p>Properties you have listed for sale or rent.</p>
                            
                            {myPropsLoading ? (
                                <p>Loading your properties...</p>
                            ) : myProperties.length > 0 ? (
                                <div className="prof-prop-list">
                                    {myProperties.map((p, idx) => (
                                        <ProfilePropertyRow
                                            key={p._id || p.id || idx}
                                            property={p}
                                            onRemove={() => handleDeleteProperty(p._id || p.id)}
                                            onView={() => navigate(`/properties/${p._id || p.id}`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FaBuilding className="empty-icon" />
                                    <p>You haven't listed any properties yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
