import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaHeart, FaRegClock, FaMagic } from 'react-icons/fa';
import './HotLeadsTab.css';

const HotLeadsTab = ({ user, API }) => {
    const [leadsData, setLeadsData] = useState({ stats: null, leads: [] });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All hot leads');

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const userId = user.id || user._id;
                const res = await axios.get(`${API}/api/agent/${userId}/leads`);
                setLeadsData(res.data);
            } catch (err) {
                console.error("Failed to fetch leads:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && API) {
            fetchLeads();
        }
    }, [user, API]);

    if (loading) {
        return <div className="hl-container">Loading hot leads...</div>;
    }

    const { stats, leads } = leadsData;

    // Filter Logic
    const filteredLeads = leads.filter(lead => {
        if (activeFilter === 'All hot leads') return true;
        if (activeFilter === 'Action needed') return lead.statusBadgeType === 'action-needed';
        if (activeFilter === 'Visit scheduled') return lead.badges.some(b => b.text.includes('Visit scheduled'));
        if (activeFilter === 'Offer stage') return lead.badges.some(b => b.text.includes('Offer'));
        if (activeFilter === 'Buyer' || activeFilter === 'Investor') return true; // mock for now
        return true;
    });

    const formatTimeAgo = (dateStr) => {
        const diff = new Date() - new Date(dateStr);
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        if (hrs < 1) return 'Just now';
        if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="hl-container">
            {/* Header */}
            <div className="hl-header">
                <div>
                    <h2>Hot leads</h2>
                    <div className="hl-header-sub">
                        {stats.total} total leads · {stats.hot} hot · {stats.actionNeeded} need immediate action
                    </div>
                </div>
                <button className="hl-add-btn">+ Add lead ↗</button>
            </div>

            {/* Stats Grid */}
            <div className="hl-stats-grid">
                <div className="hl-stat-card">
                    <div className="hl-stat-title"><div className="dot" style={{ background: '#ef4444' }}></div> Action needed</div>
                    <div className="hl-stat-val">{stats.actionNeeded}</div>
                    <div className="hl-stat-sub" style={{ color: '#ef4444' }}>Contact today</div>
                </div>
                <div className="hl-stat-card">
                    <div className="hl-stat-title"><div className="dot" style={{ background: '#f97316' }}></div> Hot</div>
                    <div className="hl-stat-val">{stats.hot}</div>
                    <div className="hl-stat-sub" style={{ color: '#f97316' }}>Active this week</div>
                </div>
                <div className="hl-stat-card">
                    <div className="hl-stat-title"><div className="dot" style={{ background: '#eab308' }}></div> Warm</div>
                    <div className="hl-stat-val">{stats.warm}</div>
                    <div className="hl-stat-sub" style={{ color: '#9ca3af' }}>Nurturing</div>
                </div>
                <div className="hl-stat-card">
                    <div className="hl-stat-title"><div className="dot" style={{ background: '#10b981' }}></div> New</div>
                    <div className="hl-stat-val">{stats.new}</div>
                    <div className="hl-stat-sub" style={{ color: '#10b981' }}>↑ {stats.new} this week</div>
                </div>
            </div>

            {/* Filters */}
            <div className="hl-filters">
                {['All hot leads', 'Action needed', 'Visit scheduled', 'Offer stage', 'Buyer', 'Investor'].map(f => (
                    <button
                        key={f}
                        className={`hl-filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
                <div className="hl-filter-sort">Sort: Match score</div>
            </div>

            {/* Leads List */}
            <div className="hl-leads-list">
                {filteredLeads.map(lead => {
                    // Match color to UI designs based on match score or type
                    let borderClass = 'border-green';
                    let bgClass = 'bg-green';
                    if (lead.statusBadgeType === 'action-needed') {
                        borderClass = 'border-red'; bgClass = 'bg-red';
                    } else if (lead.statusBadgeType === 'active') {
                        borderClass = 'border-orange'; bgClass = 'bg-green';
                    } else if (lead.statusBadgeType === 'new') {
                        borderClass = 'border-orange'; bgClass = 'bg-red';
                    }

                    // Score color logic
                    const scoreColor = lead.matchScore >= 90 ? '#10b981' : lead.matchScore >= 80 ? '#10b981' : lead.matchScore >= 75 ? '#d97706' : '#d97706';

                    return (
                        <div className={`hl-lead-card ${borderClass}`} key={lead.id}>
                            <div className="hl-card-top">
                                <div className="hl-user-info">
                                    <div className={`hl-avatar ${bgClass}`}>{lead.initials}</div>
                                    <div className="hl-user-details">
                                        <h3>
                                            {lead.name}
                                            <span className={`hl-badge-pill status`}>{lead.statusBadge}</span>
                                            <span className={`hl-badge-pill match`}>{lead.matchScore}% match</span>
                                        </h3>
                                        <p className="hl-user-meta">
                                            {lead.budgetStr} · {lead.bhkStr} · {lead.location} · {lead.occupation}
                                        </p>
                                    </div>
                                </div>
                                <div className="hl-match-score">
                                    <h2 style={{ color: scoreColor }}>{lead.matchScore}%</h2>
                                    <p>AI match</p>
                                </div>
                            </div>

                            <div className="hl-attr-row">
                                {lead.badges.map((b, idx) => (
                                    <span key={idx} className={`hl-tag ${b.color}`}>{b.text}</span>
                                ))}
                                <div className="hl-actions">
                                    <button className="hl-btn-primary">{lead.actionText}</button>
                                    <button className="hl-btn-secondary">Profile</button>
                                </div>
                            </div>

                            <div className="hl-stats-row">
                                {lead.stats.map((s, idx) => (
                                    <div className="hl-stat-item" key={idx}>
                                        {s.icon === 'eye' ? <FaEye /> : <FaHeart />} {s.text}
                                    </div>
                                ))}
                            </div>

                            <div className="hl-last-active">
                                <FaRegClock /> Last active {formatTimeAgo(lead.lastActive)}
                            </div>

                            <div className="hl-ai-insight">
                                <div className="hl-ai-icon"><FaMagic /></div>
                                <div>
                                    <strong>AI insight:</strong> {lead.aiInsight.split('↗')[0]}
                                    {lead.actionLink && <span className="hl-ai-link">{lead.actionLink}</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {filteredLeads.length === 0 && (
                    <div style={{ color: '#9ca3af', padding: '20px 0' }}>No leads found for this filter.</div>
                )}
            </div>
        </div>
    );
};

export default HotLeadsTab;
