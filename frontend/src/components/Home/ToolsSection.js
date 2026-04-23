import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalculator, FaRupeeSign, FaBalanceScale, FaChartLine, FaTimes } from 'react-icons/fa';
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
        id: 'trends',
        icon: <FaChartLine />,
        title: 'Price Trends',
        description: 'Visualize historical pricing data to understand the direction of the local housing market.',
    },
];

const ToolsSection = () => {
    const navigate = useNavigate();
    const [activeTool, setActiveTool] = useState(null);

    // EMI State
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

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
                <div className="tool-modal-overlay" onClick={() => setActiveTool(null)}>
                    <div className="tool-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="tool-modal-close" onClick={() => setActiveTool(null)}><FaTimes /></button>

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
