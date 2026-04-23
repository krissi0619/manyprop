import React from 'react';
import { FaShieldAlt, FaSearch, FaHandshake } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './WhyChoose.css';

const WhyChoose = () => {
    const features = [
        {
            id: 1,
            icon: <FaShieldAlt />,
            title: 'Trust & Verified',
            subtitle: 'Listings',
        },
        {
            id: 2,
            icon: <FaSearch />,
            title: 'Smart Search',
            subtitle: '& Filters',
        },
        {
            id: 3,
            icon: <FaHandshake />,
            title: 'Easy Contact &',
            subtitle: 'Lead Conversion',
        },
    ];

    return (
        <section className="why-choose">
            {/* Dark top section */}
            <div className="why-choose-dark">
                <div className="container">
                    <div className="why-choose-content">
                        <div className="why-choose-left">
                            <h2 className="why-choose-title">
                                Why Choose <span className="highlight">ManyProp</span>
                            </h2>
                            <div className="features-row">
                                {features.map((feature) => (
                                    <div key={feature.id} className="feature-item">
                                        <div className="feature-icon-circle">
                                            {feature.icon}
                                        </div>
                                        <div className="feature-text">
                                            <span className="feature-title">{feature.title}</span>
                                            <span className="feature-subtitle">{feature.subtitle}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="why-choose-right">
                            <div className="cta-banner">
                                <div className="cta-text">
                                    <span>List it on <span className="cta-highlight">Manyprop</span></span>
                                    <span className="cta-subtext">and get genuine leads</span>
                                </div>
                                <Link to="/post-property" className="cta-post-btn">
                                    Post Property <span className="cta-free-badge">FREE</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChoose;
