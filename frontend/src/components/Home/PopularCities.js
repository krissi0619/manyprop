import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopularCities.css';

const cities = [
  {
    id: 1,
    name: 'Kolkata',
    propertyCount: '32+ Properties',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Delhi',
    propertyCount: '32+ Properties',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Ahemdabad',
    propertyCount: '32+ Properties',
    image: 'https://images.unsplash.com/photo-1611270418597-a6c77f4b7271?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Pune',
    propertyCount: '32+ Properties',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    name: 'Mumbai',
    propertyCount: '32+ Properties',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
];

const PopularCities = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 210, behavior: 'smooth' });
    }
  };

  return (
    <section className="popular-cities">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Explore Realestate in <span className="highlight">Popular cities</span>
          </h2>
        </div>

        <div className="cities-carousel-wrapper">
          <button className="carousel-arrow left" onClick={() => scroll(-1)}>&#8592;</button>
          <div className="cities-scroll-container" ref={scrollRef}>
            {cities.map(city => (
              <div
                key={city.id}
                className="city-card"
                onClick={() => navigate(`/properties?city=${city.name}`)}
              >
                <div className="city-image-container">
                  <img src={city.image} alt={city.name} className="city-image" />
                  <div className="city-overlay">
                    <div className="city-content">
                      <h3 className="city-name">{city.name}</h3>
                      <div className="property-count">{city.propertyCount}</div>
                    </div>
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

export default PopularCities;