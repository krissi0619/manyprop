import React from 'react';
import { FaBuilding, FaHistory, FaHome, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './QuickStats.css';

const QuickStats = () => {
  const navigate = useNavigate();

  const stats = [
    {
      id: 'recent-searches',
      icon: <FaBuilding />,
      title: 'Recent Searches',
      description: 'Kolkata + 2 more',
      iconBg: 'transparent',
      borderColor: '#f9f0d0',
      action: () => navigate('/properties?city=Kolkata')
    },
    {
      id: 'recently-viewed',
      icon: <FaHistory />,
      title: 'Recently Viewed',
      description: 'Siddhi residency',
      iconBg: 'transparent',
      borderColor: '#f9f0d0',
      action: () => navigate('/properties')
    },
    {
      id: 'new-launches',
      icon: <FaHome />,
      title: 'New launches',
      description: 'Explore in Delhi',
      iconBg: 'transparent',
      borderColor: '#f9f0d0',
      action: () => navigate('/properties?city=Delhi&constructionStatus=New+Launch')
    },
    {
      id: 'verified-properties',
      icon: <FaShieldAlt />,
      title: 'Verified Properties',
      description: 'RERA Registration',
      iconBg: 'transparent',
      borderColor: '#f9f0d0',
      action: () => navigate('/properties?isVerified=true')
    }
  ];

  return (
    <section className="quick-stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map(stat => (
            <div key={stat.id} className="stat-card" onClick={stat.action} style={{ cursor: 'pointer' }}>
              <div
                className="stat-icon"
                style={{ backgroundColor: stat.iconBg }}
              >
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <p className="stat-description">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickStats;