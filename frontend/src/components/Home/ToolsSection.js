import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalculator, FaRupeeSign, FaBalanceScale, FaChartLine, FaTimes, FaRulerCombined } from 'react-icons/fa';
import './ToolsSection.css';

const tools = [
    {
        id: 'emi',
        icon: <FaCalculator />,
        title: 'EMI Calculator',
        description: 'Calculate your exact monthly payments and plan your finances effectively, making it easier.',
    },
    {
        id: 'loans',
        icon: <FaRupeeSign />,
        title: 'Home loans',
        description: 'Compare interest rates and find the best financing options tailored for your dream property.',
    },
    {
        id: 'compare',
        icon: <FaBalanceScale />,
        title: 'Compare Property',
        description: 'Analyze properties side-by-side to make confident and well-informed real estate decisions.',
    },
    {
        id: 'area',
        icon: <FaRulerCombined />,
        title: 'Area Converter',
        description: 'Easily convert property area between sq ft, sq m, acres, hectares, and more.',
    },
    {
        id: 'trends',
        icon: <FaChartLine />,
        title: 'Price Trends',
        description: 'Visualize historical pricing data to understand the direction of the local housing market.',
    },
];

const ToolsSection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTool, setActiveTool] = useState(null);

    useEffect(() => {
        if (location.hash && location.hash.startsWith('#tool-')) {
            const toolId = location.hash.replace('#tool-', '');
            if (toolId === 'compare') {
                navigate('/compare');
            } else {
                setActiveTool(toolId);
                setTimeout(() => {
                    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    }, [location, navigate]);

    const closeTool = () => {
        setActiveTool(null);
        if (location.hash.startsWith('#tool-')) {
            navigate(location.pathname, { replace: true });
        }
    };

    // EMI State
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

    // Area State
    const [areaValue, setAreaValue] = useState(1000);
    const [fromUnit, setFromUnit] = useState('sqft');
    const [toUnit, setToUnit] = useState('sqm');

    const calculateEMI = () => {
        const p = loanAmount;
        const r = interestRate / 12 / 100;
        const n = loanTenure * 12;
        if (p === 0 || r === 0 || n === 0) return 0;
        const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        return Math.round(emi);
    };

    const handleToolClick = (toolId) => {
        if (toolId === 'compare') {
            navigate('/compare');
        } else {
            setActiveTool(toolId);
        }
    };

    return (
        <section id="tools-section" className="tools-section">
            <div className="container">
                <h2 className="tools-title">
                    <span className="highlight">Tools</span> that help you
                </h2>

                <div className="tools-grid">
                    {tools.map((tool) => (
                        <div key={tool.id} className="tool-card" onClick={() => handleToolClick(tool.id)}>
                            <h3 className="tool-name">{tool.title}</h3>
                            <p className="tool-desc">{tool.description}</p>
                            <div className="tool-icon-box">
                                {tool.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {activeTool && (
                <div className="tool-modal-overlay" onClick={closeTool}>
                    <div className="tool-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="tool-modal-close" onClick={closeTool}><FaTimes /></button>

                        {activeTool === 'emi' && (
                            <div className="emi-calculator">
                                <h3>EMI Calculator</h3>
                                <p className="tool-modal-sub">Calculate your monthly home loan installment.</p>

                                <div className="emi-input-group">
                                    <label>Loan Amount (₹)</label>
                                    <input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} />
                                    <input type="range" min="100000" max="50000000" step="100000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} />
                                </div>

                                <div className="emi-input-group">
                                    <label>Interest Rate (% p.a)</label>
                                    <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
                                    <input type="range" min="1" max="20" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
                                </div>

                                <div className="emi-input-group">
                                    <label>Loan Tenure (Years)</label>
                                    <input type="number" value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} />
                                    <input type="range" min="1" max="30" step="1" value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} />
                                </div>

                                <div className="emi-result">
                                    <div>Monthly EMI</div>
                                    <strong>₹ {calculateEMI().toLocaleString()}</strong>
                                </div>
                            </div>
                        )}

                        {activeTool === 'loans' && (
                            <div className="home-loans-info">
                                <h3>Top Home Loan Offers</h3>
                                <p className="tool-modal-sub">Compare live interest rates from leading banks.</p>

                                <div className="bank-list">
                                    <div className="bank-item">
                                        <strong>SBI Home Loan</strong>
                                        <span>8.40% - 9.05%</span>
                                    </div>
                                    <div className="bank-item">
                                        <strong>HDFC Bank</strong>
                                        <span>8.50% - 9.15%</span>
                                    </div>
                                    <div className="bank-item">
                                        <strong>ICICI Bank</strong>
                                        <span>8.60% - 9.20%</span>
                                    </div>
                                    <div className="bank-item">
                                        <strong>Axis Bank</strong>
                                        <span>8.75% - 9.30%</span>
                                    </div>
                                </div>
                                <button className="tool-apply-btn">Apply Now</button>
                            </div>
                        )}

                        {activeTool === 'area' && (
                            <div className="area-converter">
                                <h3>Area Converter</h3>
                                <p className="tool-modal-sub">Convert property sizes instantly.</p>

                                <div className="emi-input-group" style={{ marginTop: '20px' }}>
                                    <label>Value to convert</label>
                                    <input type="number" value={areaValue} onChange={e => setAreaValue(Number(e.target.value))} style={{ marginBottom: '15px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#666' }}>From Unit</label>
                                        <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                            <option value="sqft">Sq. Ft (Square Feet)</option>
                                            <option value="sqm">Sq. M (Square Meters)</option>
                                            <option value="sqyd">Sq. Yd (Square Yards)</option>
                                            <option value="acre">Acres</option>
                                            <option value="hectare">Hectares</option>
                                            <option value="bigha">Bigha</option>
                                            <option value="gaj">Gaj</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#666' }}>To Unit</label>
                                        <select value={toUnit} onChange={e => setToUnit(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                            <option value="sqft">Sq. Ft (Square Feet)</option>
                                            <option value="sqm">Sq. M (Square Meters)</option>
                                            <option value="sqyd">Sq. Yd (Square Yards)</option>
                                            <option value="acre">Acres</option>
                                            <option value="hectare">Hectares</option>
                                            <option value="bigha">Bigha</option>
                                            <option value="gaj">Gaj</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="emi-result" style={{ background: '#f8f9fa', color: '#333' }}>
                                    <div>Converted Area</div>
                                    <strong style={{ color: '#e85c27' }}>
                                        {(() => {
                                            // Conversion to base (sqft)
                                            const toSqft = {
                                                sqft: 1,
                                                sqm: 10.7639,
                                                sqyd: 9,
                                                acre: 43560,
                                                hectare: 107639,
                                                bigha: 27000,
                                                gaj: 9
                                            };
                                            const baseSqft = areaValue * toSqft[fromUnit];
                                            const result = baseSqft / toSqft[toUnit];
                                            return result.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ' + toUnit;
                                        })()}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {activeTool === 'trends' && (
                            <div className="price-trends-info">
                                <h3>Real Estate Price Trends</h3>
                                <p className="tool-modal-sub">Average residential price trends over the last 5 years.</p>

                                <div className="trends-chart">
                                    <div className="trend-bar" style={{ height: '30%' }}><span>2020</span><div className="trend-val">4.2k/sqft</div></div>
                                    <div className="trend-bar" style={{ height: '35%' }}><span>2021</span><div className="trend-val">4.5k/sqft</div></div>
                                    <div className="trend-bar" style={{ height: '42%' }}><span>2022</span><div className="trend-val">5.1k/sqft</div></div>
                                    <div className="trend-bar" style={{ height: '65%' }}><span>2023</span><div className="trend-val">6.8k/sqft</div></div>
                                    <div className="trend-bar" style={{ height: '80%', background: '#e43b2c' }}><span>2024</span><div className="trend-val" style={{ color: '#e43b2c' }}>8.2k/sqft</div></div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </section>
    );
};

export default ToolsSection;
