import React from 'react';
import { FaSearch, FaEye, FaRocket, FaShieldAlt } from 'react-icons/fa';
import './ServicesSection.css';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      icon: <FaSearch />,
      title: 'Recent Searches',
      description: 'Explore + 2 more'
    },
    {
      id: 2,
      icon: <FaEye />,
      title: 'Recently Viewed',
      description: 'Your recent properties'
    },
    {
      id: 3,
      icon: <FaRocket />,
      title: 'New launches',
      description: 'Explore top launches'
    },
    {
      id: 4,
      icon: <FaShieldAlt />,
      title: 'Verified Properties',
      description: '100% Registered'
    }
  ];

  return (
    <section className="services section">
      <div className="container">
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                {service.icon}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;