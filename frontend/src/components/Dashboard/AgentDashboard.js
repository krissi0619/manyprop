import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaBuilding, FaUsers, FaHandshake, FaMoneyBillWave, 
    FaPlus, FaFire, FaCalendarAlt, FaChartPie, FaCheckCircle, FaStar
} from 'react-icons/fa';
import './AgentDashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AgentDashboard = ({ setActiveTab }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { activeListings: 0, activeLeads: 0, dealsClosedMTD: 0, commissionMTD: 0 },
        commissionChart: [],
        hotLeads: [],
        pipeline: { stages: { new: 0, visit: 0, negotiation: 0, closing: 0 }, deals: [], totalValue: 0 },
        schedule: [],
        aiAlert: null
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('mp_user') || '{}');
        setUser(storedUser);

        const fetchAgentData = async () => {
            try {
                const res = await axios.get(`${API}/api/agent/${storedUser.id || storedUser._id}/dashboard`);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch agent dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        if (storedUser.id || storedUser._id) fetchAgentData();
    }, []);

    const formatLakhs = (val) => {
        if (!val) return '₹0';
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        return `₹${val.toLocaleString()}`;
    };

    if (loading) return <div className="ad-loading">Loading Agent Dashboard...</div>;

    const { stats, commissionChart, hotLeads, pipeline, schedule, aiAlert } = data;

    // Commission logic
    const totalEarned = commissionChart.reduce((sum, m) => sum + m.earned, 0);
    const target = 800000; // Mock target ₹8L
    const progressPercent = Math.min((totalEarned / target) * 100, 100);

    return (
        <div className="agent-dashboard">
            {/* Header */}
            <div className="ad-header">
                <div className="ad-header-user">
                    <div className="ad-avatar">
                        {user.profile?.avatar ? <img src={user.profile.avatar} alt="agent" /> : (user.name?.charAt(0) || 'A')}
                    </div>
                    <div>
                        <h2>{user.name}</h2>
                        <p>Senior Agent • RERA Certified</p>
                    </div>
                </div>
                <div className="ad-badges">
                    <span className="ad-badge top-agent"><FaStar /> Top agent • May</span>
                    <span className="ad-badge verified"><FaCheckCircle /> Verified</span>
                </div>
            </div>

            {/* AI Deal Alert Banner */}
            {aiAlert && (
                <div className="ad-ai-alert">
                    <div className="ad-ai-icon">✨</div>
                    <p><strong>AI deal alert:</strong> {aiAlert} <span className="ad-ai-link" onClick={() => setActiveTab('enquiries')}>Contact now ↗</span></p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="ad-kpi-grid">
                <div className="ad-kpi-card">
                    <div className="ad-kpi-title"><FaBuilding /> Active listings</div>
                    <div className="ad-kpi-val">{stats.activeListings}</div>
                    <div className="ad-kpi-sub good">↑ Managed right now</div>
                </div>
                <div className="ad-kpi-card">
                    <div className="ad-kpi-title"><FaUsers /> Active leads</div>
                    <div className="ad-kpi-val">{stats.activeLeads}</div>
                    <div className="ad-kpi-sub good">↑ Unique prospects</div>
                </div>
                <div className="ad-kpi-card">
                    <div className="ad-kpi-title"><FaHandshake /> Deals closed (MTD)</div>
                    <div className="ad-kpi-val">{stats.dealsClosedMTD}</div>
                    <div className="ad-kpi-sub neutral">This month</div>
                </div>
                <div className="ad-kpi-card">
                    <div className="ad-kpi-title"><FaMoneyBillWave /> Commission earned</div>
                    <div className="ad-kpi-val">{formatLakhs(stats.commissionMTD)}</div>
                    <div className="ad-kpi-sub good">↑ MTD standard 2%</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="ad-actions-grid">
                <button className="ad-action-btn" onClick={() => setActiveTab('post-property')}>
                    <FaPlus className="ad-action-icon" /> Add listing
                </button>
                <button className="ad-action-btn" onClick={() => setActiveTab('enquiries')}>
                    <FaFire className="ad-action-icon hot" /> Hot leads
                </button>
                <button className="ad-action-btn" onClick={() => setActiveTab('offers-received')}>
                    <FaChartPie className="ad-action-icon pipeline" /> Pipeline
                </button>
                <button className="ad-action-btn" onClick={() => setActiveTab('enquiries')}>
                    <FaCalendarAlt className="ad-action-icon visit" /> Book visit
                </button>
            </div>

            {/* Middle Row: Commission & Schedule */}
            <div className="ad-middle-row">
                <div className="ad-panel commission-panel">
                    <div className="ad-panel-head">
                        <h3>₹ Commission tracker</h3>
                        <span>Last 6 months</span>
                    </div>
                    <div className="ad-comm-target">
                        <h2>{formatLakhs(totalEarned)} <span>earned • target {formatLakhs(target)}</span></h2>
                        <div className="ad-progress-bar">
                            <div className="ad-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p>{progressPercent.toFixed(1)}% of target • {formatLakhs(target - totalEarned)} to go</p>
                    </div>

                    <div className="ad-bar-chart">
                        {commissionChart.map((m, i) => {
                            const h = Math.max((m.earned / (Math.max(...commissionChart.map(x=>x.earned)) || 1)) * 100, 10);
                            return (
                                <div className="ad-bar-col" key={i}>
                                    <div className="ad-bar" style={{ height: `${h}%` }}></div>
                                    <span>{m.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="ad-comm-footer">
                        <div>
                            <span>Avg per deal</span>
                            <strong>{stats.dealsClosedMTD ? formatLakhs(stats.commissionMTD / stats.dealsClosedMTD) : '₹0'}</strong>
                        </div>
                        <div>
                            <span>Deals closed</span>
                            <strong>{stats.dealsClosedMTD} this month</strong>
                        </div>
                    </div>
                </div>

                <div className="ad-panel schedule-panel">
                    <div className="ad-panel-head">
                        <h3><FaCalendarAlt /> Today's schedule</h3>
                        <span className="ad-link" onClick={() => setActiveTab('enquiries')}>Full week ↗</span>
                    </div>
                    <div className="ad-timeline">
                        {schedule.length === 0 ? (
                            <p className="ad-empty">No visits scheduled for today.</p>
                        ) : (
                            schedule.map(s => (
                                <div className="ad-time-item" key={s.id}>
                                    <div className="ad-time-badge">
                                        <small>TODAY</small>
                                        <strong>{s.time}</strong>
                                    </div>
                                    <div className="ad-time-info">
                                        <h4>{s.title}</h4>
                                        <p>With {s.with}</p>
                                    </div>
                                    <span className="ad-status-badge upcoming">Upcoming</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Hot Leads & Pipeline */}
            <div className="ad-bottom-row">
                <div className="ad-panel leads-panel">
                    <div className="ad-panel-head">
                        <h3><FaFire color="#e85d04" /> Hot leads</h3>
                        <span className="ad-link" onClick={() => setActiveTab('enquiries')}>All leads ↗</span>
                    </div>
                    <div className="ad-list">
                        {hotLeads.length === 0 ? <p className="ad-empty">No active leads found.</p> : hotLeads.map(lead => (
                            <div className="ad-lead-item" key={lead.id}>
                                <div className="ad-lead-avatar">{lead.name.substring(0,2).toUpperCase()}</div>
                                <div className="ad-lead-info">
                                    <h4>{lead.name}</h4>
                                    <p>{lead.targetProperty}</p>
                                    <small>{lead.context}</small>
                                </div>
                                <div className="ad-lead-meta">
                                    <span className="ad-match">{lead.matchScore}% match</span>
                                    <span className={`ad-status-badge ${lead.status === 'New' ? 'new' : 'active'}`}>{lead.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ad-panel pipeline-panel">
                    <div className="ad-panel-head">
                        <h3><FaChartPie /> Deal pipeline</h3>
                        <span className="ad-link" onClick={() => setActiveTab('offers-received')}>Details ↗</span>
                    </div>
                    <div className="ad-pipe-breakdown">
                        <p className="ad-pipe-label">STAGE BREAKDOWN</p>
                        <div className="ad-pipe-bar">
                            <div className="p-new" style={{ flex: pipeline.stages.new || 1 }}></div>
                            <div className="p-visit" style={{ flex: pipeline.stages.visit || 1 }}></div>
                            <div className="p-nego" style={{ flex: pipeline.stages.negotiation || 1 }}></div>
                            <div className="p-close" style={{ flex: pipeline.stages.closing || 1 }}></div>
                        </div>
                        <div className="ad-pipe-legend">
                            <span>New ({pipeline.stages.new})</span>
                            <span>Visit ({pipeline.stages.visit})</span>
                            <span>Nego ({pipeline.stages.negotiation})</span>
                            <span>Closing ({pipeline.stages.closing})</span>
                        </div>
                    </div>
                    <div className="ad-list">
                        {pipeline.deals.slice(0,4).map(deal => (
                            <div className="ad-deal-item" key={deal.id}>
                                <div className="ad-deal-icon"><FaBuilding /></div>
                                <div className="ad-deal-info">
                                    <h4>{deal.propertyTitle}</h4>
                                    <p>{deal.buyerName}</p>
                                </div>
                                <div className="ad-deal-meta">
                                    <strong>{formatLakhs(deal.price)}</strong>
                                    <span className="ad-status-badge stage">{deal.stage}</span>
                                </div>
                            </div>
                        ))}
                        {pipeline.deals.length === 0 && <p className="ad-empty">No active deals in pipeline.</p>}
                    </div>
                    <div className="ad-pipe-total">
                        <div>
                            <span>Total pipeline value</span>
                            <p>Across {pipeline.deals.length} active deals</p>
                        </div>
                        <h2>{formatLakhs(pipeline.totalValue)} comm.</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
