import React, { useRef, useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_PROPERTIES } from '../../api/config';
import './FeaturedProjects.css';

const mockProjects = [
  {
    _id: '1',
    title: 'Luxury Twin tower',
    typeInfo: '2 BHK | 3 BHK Flats',
    priceRange: '1.5-2.1 crore',
    location: 'Andal Durgapur',
    possession: 'Possession from May 2028',
    developer: 'By Dayal Group',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  {
    _id: '2',
    title: 'Skyline Skyline',
    typeInfo: '3 BHK | 4 BHK Flats',
    priceRange: '2.5-3.5 crore',
    location: 'Bandra West, Mumbai',
    possession: 'Ready To Move',
    developer: 'By Macrotech Developers',
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  {
    _id: '3',
    title: 'Grand Residences',
    typeInfo: '3 BHK | 4 BHK Flats',
    priceRange: '2.5-3.8 crore',
    location: 'Jubilee Hills, Hyderabad',
    possession: 'Possession from Dec 2027',
    developer: 'By Prestige Group',
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  {
    _id: '4',
    title: 'Godrej Woods',
    typeInfo: '2 BHK | 3 BHK Flats',
    priceRange: '1.2-1.8 crore',
    location: 'Sector 43, Noida',
    possession: 'Possession from Mar 2026',
    developer: 'By Godrej Properties',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  {
    _id: '5',
    title: 'DLF The Camellias',
    typeInfo: '4 BHK | 5 BHK Flats',
    priceRange: '30.0-35.0 crore',
    location: 'Golf Course Road, Gurgaon',
    possession: 'Ready To Move',
    developer: 'By DLF Limited',
    images: ['https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  {
    _id: '6',
    title: 'Sobha City',
    typeInfo: '2 BHK | 3 BHK Flats',
    priceRange: '1.9-2.5 crore',
    location: 'Thanisandra, Bangalore',
    possession: 'Possession from Aug 2025',
    developer: 'By Sobha Limited',
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  }
];

const FeaturedProjects = () => {
  const scrollRef = useRef(null);
  const [wishlisted, setWishlisted] = useState({});
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_PROPERTIES}?featured=true&limit=6`);
        if (res.data.properties && res.data.properties.length > 0) {
          setProjects(res.data.properties);
        } else {
          setProjects(mockProjects);
        }
      } catch (err) {
        setProjects(mockProjects);
      }
    };
    fetchProjects();
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' });
    }
  };

  const toggleWishlist = (id) => {
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="featured-projects">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="highlight">Featured</span> Projects in Delhi
          </h2>
          <button className="view-all-btn" onClick={() => navigate('/properties?featured=true')}>Explore all →</button>
        </div>

        <div className="projects-carousel-wrapper">
          <button className="carousel-arrow left" onClick={() => scroll(-1)}>&#8592;</button>
          <div className="projects-scroll-container" ref={scrollRef}>
            {projects.map(project => (
              <div key={project._id || project.id} className="project-card">
                <div className="project-image-container">
                  <img src={project.images?.[0] || project.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={project.title} className="project-image" />
                  <div className="project-badges">
                    <div className="project-badge">
                      <span className="project-badge-dot"></span>
                      Posted by {project.postedBy || 'Owner'}
                    </div>
                  </div>
                  <button className="project-wishlist" onClick={() => toggleWishlist(project._id || project.id)}>
                    {wishlisted[project._id || project.id] ? <FaHeart style={{ color: '#0f172a' }} /> : <FaRegHeart />}
                  </button>
                </div>

                <div className="project-content">
                  <div className="project-top-row">
                    <div>
                      <h3 className="project-title">{project.title}</h3>
                      <div className="project-location-row" style={{ marginTop: '4px' }}>
                        <FaMapMarkerAlt className="project-location-icon" />
                        <span>{project.address?.locality || project.location}, {project.address?.city || 'Delhi'}</span>
                      </div>
                    </div>
                    <div className="project-right-col" style={{ textAlign: 'right' }}>
                      <div className="project-type-info">{project.bhkTypes?.join(' | ') || project.typeInfo || '2 BHK | 3 BHK Flats'}</div>
                      <div className="project-price-range">{project.price >= 10000000 ? `${(project.price / 10000000).toFixed(1)} Crore` : project.price >= 100000 ? `${(project.price / 100000).toFixed(0)} Lakhs` : project.priceRange || '1.5-2.1 crore'}</div>
                    </div>
                  </div>

                  <div className="project-meta-row">
                    <span>{project.constructionStatus === 'Ready To Move' ? 'Ready to move' : project.possession || 'Possession from May 2028'}</span>
                    <span className="project-developer">{project.agentContact?.company || project.developer || 'By Dayal Droup'}</span>
                  </div>

                  <div className="project-footer">
                    <button className="project-compare-btn" onClick={(e) => {
                      e.stopPropagation();
                      try {
                        const list = JSON.parse(localStorage.getItem('manyprop_compare')) || [];
                        const exists = list.some(p => (p._id || p.id) === (project._id || project.id));
                        if (!exists && list.length < 3) {
                          list.push(project);
                          localStorage.setItem('manyprop_compare', JSON.stringify(list));
                        }
                      } catch (err) { }
                      navigate('/compare');
                    }}>Compare</button>
                    <button className="project-view-btn" onClick={() => navigate(`/properties/${project._id || project.id}`)}>View Details</button>
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

export default FeaturedProjects;