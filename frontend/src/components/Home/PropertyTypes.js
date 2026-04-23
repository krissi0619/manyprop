import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyTypes.css';

const propertyTypes = [
  {
    id: 1,
    name: 'Independent\nHouse',
    type: 'independent_house',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Apartment',
    type: 'apartment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Villa',
    type: 'villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Luxury Bungalow',
    type: 'luxury_bungalow',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Plot / Land',
    type: 'plot',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const PropertyTypes = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  return (
    <section className="property-types">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            All <span className="highlight">Property types</span> that you want
          </h2>
        </div>

        <div className="types-carousel-wrapper">
          <button className="carousel-arrow left" onClick={() => scroll(-1)}>&#8592;</button>
          <div className="types-scroll-container" ref={scrollRef}>
            {propertyTypes.map(type => (
              <div
                key={type.id}
                className="type-card"
                onClick={() => navigate(`/properties?type=${type.type}`)}
              >
                <div className="type-image-container">
                  <img src={type.image} alt={type.name} className="type-image" />
                  <div className="type-overlay">
                    <h3 className="type-name">{type.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-arrow right" onClick={() => scroll(1)}>&#8594;</button>
        </div>
      </div>
    </section>
  );
};

export default PropertyTypes;