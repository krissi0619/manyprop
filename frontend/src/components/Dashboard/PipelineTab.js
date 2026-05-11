import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaPhone, FaCalendarAlt, FaFileContract, FaCheckCircle, FaTimesCircle, FaMagic } from 'react-icons/fa';
import './PipelineTab.css';

const PipelineTab = ({ user, API }) => {
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const userId = user.id || user._id;
                const res = await axios.get(`${API}/api/agent/${userId}/pipeline`);
                setColumns(res.data.columns);
            } catch (err) {
                console.error("Failed to fetch pipeline data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && API) {
            fetchPipeline();
        }
    }, [user, API]);

    if (loading) {
        return <div className="pipeline-container">Loading pipeline...</div>;
    }

    const columnOrder = ['newLeads', 'contacted', 'visitScheduled', 'offerStage', 'closed', 'lost'];
    const columnIcons = {
        newLeads: <FaUserPlus />,
        contacted: <FaPhone />,
        visitScheduled: <FaCalendarAlt />,
        offerStage: <FaFileContract />,
        closed: <FaCheckCircle />,
        lost: <FaTimesCircle />
    };

    const dotColors = {
        newLeads: '#e85c27',
        contacted: '#e85c27',
        visitScheduled: '#10b981',
        offerStage: '#ef4444',
        closed: '#10b981',
        lost: '#6b7280'
    };

    return (
        <div className="pipeline-container">
            <div className="pipeline-header">
                <h2>Deal Pipeline</h2>
            </div>

            <div className="pipeline-board">
                {columnOrder.map(colKey => {
                    const col = columns[colKey];
                    if (!col) return null;
                    return (
                        <div className="pipeline-column" key={col.id}>
                            <div className="pipeline-column-header">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {columnIcons[colKey]} {col.title}
                                </span>
                                <span className="pipeline-column-count">{col.items.length}</span>
                            </div>
                            
                            {col.items.map(item => (
                                <div className="pipeline-card" key={item.id}>
                                    <div className="pipeline-card-top">
                                        <div className="pipeline-card-dot" style={{ background: dotColors[colKey] }}></div>
                                        <div className="pipeline-card-info">
                                            <h4 className="pipeline-card-name">{item.name}</h4>
                                            <p className="pipeline-card-details">{item.details}</p>
                                            {item.offerInfo && <p className="pipeline-card-details" style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{item.offerInfo}</p>}
                                        </div>
                                    </div>
                                    <div className="pipeline-card-badges">
                                        {item.badges.map((b, idx) => (
                                            <span key={idx} className={`pipeline-card-badge ${b.color}`}>{b.text}</span>
                                        ))}
                                    </div>
                                    <div className="pipeline-card-actions">
                                        {colKey === 'newLeads' && <button className="pipeline-card-btn primary">Contact</button>}
                                        {colKey === 'contacted' && <button className="pipeline-card-btn primary">Schedule Visit</button>}
                                        {colKey === 'visitScheduled' && <button className="pipeline-card-btn primary">Follow up</button>}
                                        {colKey === 'offerStage' && <button className="pipeline-card-btn">Counter offer ↗</button>}
                                        {colKey === 'closed' && <button className="pipeline-card-btn">View deal</button>}
                                        {colKey === 'lost' && <button className="pipeline-card-btn">Why lost? ↗</button>}
                                    </div>
                                </div>
                            ))}
                            {col.items.length === 0 && (
                                <div style={{ color: 'var(--light-grey)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                                    No items in this stage
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineTab;
