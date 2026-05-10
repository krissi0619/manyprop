import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PriceAnalysisModal.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PriceAnalysisModal = ({ propertyId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const barRef = useRef(null);

    useEffect(() => {
        if (!propertyId) return;
        setLoading(true);
        setError(null);
        axios.get(`${API}/api/analysis/property/${propertyId}`)
            .then(res => {
                setData(res.data);
                // Default to recommended scenario
                const rec = res.data.scenarios?.find(s => s.recommended);
                if (rec) setSelectedScenario(rec);
            })
            .catch(err => {
                setError('Failed to load analysis. Please ensure the backend is running.');
                console.error('[PriceAnalysis] Error:', err);
            })
            .finally(() => setLoading(false));
    }, [propertyId]);

    // Trap keyboard ESC to close
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleApplyPrice = async () => {
        if (!selectedScenario || !propertyId) return;
        setApplying(true);
        try {
            const token = localStorage.getItem('mp_token');
            await axios.put(`${API}/api/properties/${propertyId}`,
                { price: selectedScenario.price },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApplySuccess(true);
            setTimeout(() => { setApplySuccess(false); onClose(); }, 2000);
        } catch (err) {
            alert('Failed to apply price update. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="pam-overlay" onClick={onClose}>
                <div className="pam-container pam-loading-state" onClick={e => e.stopPropagation()}>
                    <div className="pam-loader">
                        <div className="pam-spinner" />
                        <h3>Analysing your listing...</h3>
                        <p>Fetching market comparables & generating AI insights</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pam-overlay" onClick={onClose}>
                <div className="pam-container" onClick={e => e.stopPropagation()}>
                    <div className="pam-error-state">
                        <span className="pam-error-icon">⚠️</span>
                        <p>{error}</p>
                        <button onClick={onClose} className="pam-close-btn-inline">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { property, kpis, market, scenarios, aiRecommendations, comparableListings } = data;

    // Price deviation badge
    const devPct = market.deviationPct;
    const isAbove = market.isAboveMarket;

    return (
        <div className="pam-overlay" onClick={onClose}>
            <div className="pam-container" onClick={e => e.stopPropagation()}>

                {/* ── Close button ────────────────────── */}
                <button className="pam-close-x" onClick={onClose} title="Close">✕</button>

                {/* ═══════════════════════════════════════ */}
                {/* 1. PROPERTY HEADER                      */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-header-block">
                    <div className="pam-header-icon">🏢</div>
                    <div className="pam-header-info">
                        <div className="pam-header-top-row">
                            <div>
                                <h2 className="pam-prop-title">{property.title}</h2>
                                <p className="pam-prop-meta">
                                    {property.address?.locality && <span>📍 {property.address.locality}</span>}
                                    {property.area && <span> · {property.area.toLocaleString()} sqft</span>}
                                    <span> · Listed {kpis.daysOnMarket} days ago</span>
                                    {property.isVerified && <span> · <span className="pam-rera-badge">RERA registered</span></span>}
                                </p>
                            </div>
                            <div className="pam-price-col">
                                <span className="pam-main-price">{property.priceFormatted}</span>
                                <span className={`pam-market-dev ${isAbove ? 'above' : 'below'}`}>
                                    {devPct}% {isAbove ? 'above market' : 'below market'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* 2. KPI ROW                              */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-kpi-row">
                    <div className="pam-kpi-card">
                        <p className="pam-kpi-label">Your price / sqft</p>
                        <h3 className="pam-kpi-value">{kpis.pricePerSqft}</h3>
                        <p className={`pam-kpi-sub ${isAbove ? 'warn' : 'good'}`}>
                            Market avg {kpis.marketAvgPricePerSqft}
                        </p>
                    </div>
                    <div className="pam-kpi-card">
                        <p className="pam-kpi-label">Days on market</p>
                        <h3 className="pam-kpi-value">{kpis.daysOnMarket}</h3>
                        <p className="pam-kpi-sub warn">Avg closure {kpis.avgMarketDays} days</p>
                    </div>
                    <div className="pam-kpi-card">
                        <p className="pam-kpi-label">Inquiry rate</p>
                        <h3 className="pam-kpi-value">{kpis.inquiryCount}</h3>
                        <p className={`pam-kpi-sub ${kpis.inquiryCount < kpis.inquiryBenchmark ? 'warn' : 'good'}`}>
                            {kpis.inquiryCount < kpis.inquiryBenchmark
                                ? `↓ ${Math.round((kpis.inquiryCount / kpis.inquiryBenchmark) * 100)}% vs similar`
                                : `↑ ${Math.round((kpis.inquiryCount / kpis.inquiryBenchmark) * 100)}% vs similar`}
                        </p>
                    </div>
                    <div className="pam-kpi-card">
                        <p className="pam-kpi-label">Listing quality</p>
                        <h3 className="pam-kpi-value">{kpis.qualityScore}/100</h3>
                        <p className="pam-kpi-sub neutral">
                            {kpis.qualityScore >= 80 ? 'Excellent listing!' : kpis.qualityScore >= 65 ? 'Add photos to improve' : 'Needs improvement'}
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* 3. PRICE SPECTRUM BAR                   */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-spectrum-card">
                    <h4 className="pam-spectrum-title">
                        <span className="spectrum-icon">📈</span>
                        Where your price sits in the market
                    </h4>
                    <div className="pam-spectrum-labels">
                        <span>{market.minPriceFormatted} <span className="pam-s-hint">(lowest)</span></span>
                        <span>{market.avgPriceFormatted} <span className="pam-s-hint">(market avg)</span></span>
                        <span>{market.maxPriceFormatted} <span className="pam-s-hint">(highest)</span></span>
                    </div>
                    <div className="pam-spectrum-bar-wrap">
                        <div className="pam-spectrum-bar" ref={barRef}>
                            <div
                                className="pam-listing-marker"
                                style={{ left: `${market.pricePosition}%` }}
                            >
                                <span className="pam-marker-label">Your listing {property.priceFormatted}</span>
                                <div className="pam-marker-line" />
                            </div>
                        </div>
                    </div>
                    <div className="pam-spectrum-zones">
                        <span className="zone green">● Sweet spot {market.sweetSpotMin}–{market.sweetSpotMax}</span>
                        <span className="zone orange">● Caution zone {market.cautionMin}–{market.cautionMax}</span>
                        <span className="zone red">● Overpriced above {market.overpriceAbove}</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* 4. PRICING SCENARIOS                    */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-scenarios-section">
                    <h4 className="pam-section-title">
                        <span>⚖️</span> Pricing scenarios — pick your strategy
                    </h4>
                    <div className="pam-scenarios-grid">
                        {scenarios.map((s) => (
                            <div
                                key={s.tag}
                                className={`pam-scenario-card ${s.recommended ? 'pam-recommended' : ''} ${selectedScenario?.tag === s.tag ? 'pam-selected' : ''}`}
                                onClick={() => setSelectedScenario(s)}
                            >
                                <span className={`pam-scenario-badge ${s.tag}`}>{s.label}</span>
                                <div className="pam-scenario-price">{s.priceFormatted}</div>
                                <div className="pam-scenario-psqft">{s.pricePerSqftFormatted} / sqft</div>
                                <ul className="pam-scenario-details">
                                    <li>🕐 Est. {s.days}</li>
                                    <li>👥 {s.inquiryBoost}</li>
                                    <li>↘ {s.vsCurrentFormatted}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="pam-scenarios-hint">
                        💡 Tap any scenario to select — then apply the price to your listing anytime
                    </p>
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* 5. AI RECOMMENDATIONS                   */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-ai-section">
                    <h4 className="pam-section-title">
                        <span className="pam-ai-sparkle">✨</span> AI recommendations to boost deal velocity
                    </h4>
                    <div className="pam-ai-list">
                        {aiRecommendations.map((rec, idx) => (
                            <div key={idx} className="pam-ai-item">
                                <div className="pam-ai-icon-wrap">{rec.icon || '💡'}</div>
                                <div className="pam-ai-content">
                                    <h5>{rec.title}</h5>
                                    <p>{rec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* 6. COMPARABLE LISTINGS TABLE            */}
                {/* ═══════════════════════════════════════ */}
                {comparableListings && comparableListings.length > 0 && (
                    <div className="pam-comparables-section">
                        <h4 className="pam-section-title">
                            <span>🔳</span> Comparable listings — {property.address?.city}, {property.kpis?.bedrooms || property.bedrooms || ''} BHK
                        </h4>
                        <table className="pam-comparables-table">
                            <thead>
                                <tr>
                                    <th>PROPERTY</th>
                                    <th>PRICE</th>
                                    <th>₹/SQFT</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparableListings.map((c, idx) => (
                                    <tr key={idx} className={c.isYourListing ? 'pam-your-listing-row' : ''}>
                                        <td>
                                            <div className="pam-comp-prop-name">{c.isYourListing ? `Your listing · ${c.area ? c.area + ' sqft' : ''}` : c.title}</div>
                                            {c.floor && <div className="pam-comp-prop-sub">{c.floor}{c.furnished ? ` · ${c.furnished.replace('_', ' ')}` : ''}</div>}
                                        </td>
                                        <td className={c.isYourListing ? 'pam-your-price' : ''}>{c.price}</td>
                                        <td>{c.pricePerSqft}</td>
                                        <td>
                                            <span className={`pam-status-pill ${
                                                c.status.includes('Sold') ? 'sold' :
                                                c.status.includes('offer') ? 'under-offer' : 'active'
                                            } ${c.isYourListing ? 'your-listing-status' : ''}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ═══════════════════════════════════════ */}
                {/* 7. STICKY BOTTOM ACTION BAR             */}
                {/* ═══════════════════════════════════════ */}
                <div className="pam-action-bar">
                    <button
                        className={`pam-apply-btn ${applySuccess ? 'pam-success' : ''}`}
                        onClick={handleApplyPrice}
                        disabled={!selectedScenario || applying || applySuccess}
                    >
                        {applySuccess ? '✓ Price Updated!' : applying ? 'Applying...' : `✓ Apply ${selectedScenario?.priceFormatted || ''} price ↗`}
                    </button>
                    <button className="pam-dismiss-btn" onClick={onClose}>
                        Dismiss ↗
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PriceAnalysisModal;
