import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HomePropertyCard from '../Common/HomePropertyCard';
import { API_PROPERTIES } from '../../api/config';
import './RecommendedProperties.css';

/* ── All mock properties covering buy & rent ── */
const ALL_MOCK = [
  { _id: '1',  title: 'Modern Apartment Complex',      price: 7500000, priceType: 'sale', propertyType: 'apartment', address: { city: 'Noida', state: 'New Delhi' },   details: { bedrooms: 3, area: 750, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'], recommended: true },
  { _id: '2',  title: 'Luxury Villa Project',           price: 7500000, priceType: 'sale', propertyType: 'villa',      address: { city: 'Noida', state: 'New Delhi' },   details: { bedrooms: 4, area: 1200, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'], recommended: true },
  { _id: '3',  title: 'Premium Apartment Setup',        price: 7500000, priceType: 'sale', propertyType: 'apartment', address: { city: 'Noida', state: 'New Delhi' },   details: { bedrooms: 3, area: 750, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'], recommended: true },
  { _id: '4',  title: 'City View Apartment',            price: 8500000, priceType: 'sale', propertyType: 'apartment', address: { city: 'Noida', state: 'New Delhi' },   details: { bedrooms: 3, area: 750, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'], recommended: true },
  { _id: '5',  title: 'Cozy 2BHK for Rent',            price: 22000,   priceType: 'rent', propertyType: 'apartment', address: { city: 'Mumbai', state: 'Maharashtra' }, details: { bedrooms: 2, area: 600, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80'], recommended: true },
  { _id: '6',  title: 'Furnished 1BHK for Rent',        price: 15000,   priceType: 'rent', propertyType: 'apartment', address: { city: 'Pune', state: 'Maharashtra' },   details: { bedrooms: 1, area: 480, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'], recommended: true },
  { _id: '7',  title: 'Spacious 3BHK Rental',          price: 35000,   priceType: 'rent', propertyType: 'apartment', address: { city: 'Bangalore', state: 'Karnataka' }, details: { bedrooms: 3, area: 900, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'], recommended: true },
  { _id: '8',  title: 'PG Room Near IT Park',           price: 8000,    priceType: 'rent', propertyType: 'pg',        address: { city: 'Pune', state: 'Maharashtra' },   details: { bedrooms: 1, area: 200, areaUnit: 'sqft' },  images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'], recommended: true },
  { _id: '9',  title: 'Commercial Office Space',        price: 12500000, priceType: 'sale', propertyType: 'commercial', address: { city: 'Mumbai', state: 'Maharashtra' }, details: { bedrooms: 0, area: 2000, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'], recommended: true },
  { _id: '10', title: 'Ready-to-Move Plot',             price: 2500000, priceType: 'sale', propertyType: 'plot',      address: { city: 'Pune', state: 'Maharashtra' },   details: { bedrooms: 0, area: 1800, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'], recommended: true },
];

/* Filter mock data based on search state */
const filterMock = (searchState) => {
  const tab = (searchState?.tab || 'BUY').toUpperCase();
  let filtered = [...ALL_MOCK];

  if (tab === 'RENT') {
    filtered = filtered.filter(p => p.priceType === 'rent');
  } else if (tab === 'PG') {
    filtered = filtered.filter(p => p.propertyType === 'pg');
  } else if (tab === 'COMMERCIAL') {
    filtered = filtered.filter(p => p.propertyType === 'commercial');
  } else if (tab === 'PLOTS') {
    filtered = filtered.filter(p => p.propertyType === 'plot');
  } else {
    // BUY / PROJECTS / default → show sale properties
    filtered = filtered.filter(p => p.priceType === 'sale');
  }

  return filtered;
};

/* Label for the section heading based on active tab */
const getSectionLabel = (tab) => {
  switch ((tab || 'BUY').toUpperCase()) {
    case 'RENT':       return { pre: 'Recommended', highlight: 'Rentals', post: 'for you' };
    case 'PG':         return { pre: 'Recommended', highlight: 'PG / Co-Living', post: 'for you' };
    case 'COMMERCIAL': return { pre: 'Recommended', highlight: 'Commercial', post: 'Spaces' };
    case 'PLOTS':      return { pre: 'Recommended', highlight: 'Plots & Land', post: 'for you' };
    case 'PROJECTS':   return { pre: 'Featured', highlight: 'New Projects', post: 'by ManyProp' };
    default:           return { pre: 'Recommended', highlight: 'properties', post: 'for you' };
  }
};

const RecommendedProperties = ({ searchState }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = (searchState?.tab || 'BUY').toUpperCase();

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const fetchProperties = async () => {
      try {
        // Build query based on current tab
        const params = new URLSearchParams();
        params.set('recommended', 'true');
        params.set('limit', '8');

        if (activeTab === 'RENT')       { params.set('priceType', 'rent'); }
        else if (activeTab === 'PG')    { params.set('propertyType', 'pg'); }
        else if (activeTab === 'COMMERCIAL') { params.set('propertyType', 'commercial'); }
        else if (activeTab === 'PLOTS') { params.set('propertyType', 'plot'); }
        else                            { params.set('priceType', 'sale'); }

        if (searchState?.city?.trim()) params.set('city', searchState.city.trim());

        const res = await axios.get(`${API_PROPERTIES}?${params.toString()}`, { timeout: 6000 });

        if (cancelled) return;

        if (res.data.properties && res.data.properties.length > 0) {
          setProperties(res.data.properties);
        } else {
          setProperties(filterMock(searchState));
        }
      } catch (err) {
        if (!cancelled) setProperties(filterMock(searchState));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProperties();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchState?.city]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  const label = getSectionLabel(activeTab);

  // Build "Explore all" URL matching current tab
  const buildExploreUrl = () => {
    const params = new URLSearchParams();
    if (activeTab === 'RENT')       { params.set('operation', 'rent'); }
    else if (activeTab === 'PG')    { params.set('propertyType', 'pg'); }
    else if (activeTab === 'COMMERCIAL') { params.set('propertyType', 'commercial'); }
    else if (activeTab === 'PLOTS') { params.set('propertyType', 'plot'); }
    else if (activeTab === 'PROJECTS') { params.set('propertyType', 'project'); }
    else                            { params.set('operation', 'buy'); }
    return `/properties?${params.toString()}`;
  };

  return (
    <section className="recommended-properties">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {label.pre} <span className="highlight">{label.highlight}</span> {label.post}
          </h2>
          <button className="view-all-btn" onClick={() => navigate(buildExploreUrl())}>
            Explore all →
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: '0.9rem' }}>
            Loading properties…
          </div>
        ) : (
          <div className="properties-carousel-wrapper">
            <button className="carousel-arrow left" onClick={() => scroll(-1)}>&#8592;</button>
            <div className="properties-scroll-container" ref={scrollRef}>
              {properties.length > 0
                ? properties.map(property => (
                    <HomePropertyCard key={property._id || property.id} property={property} />
                  ))
                : (
                  <div style={{ padding: '40px 20px', color: '#aaa', fontSize: '0.9rem' }}>
                    No properties found. Try a different filter.
                  </div>
                )
              }
            </div>
            <button className="carousel-arrow right" onClick={() => scroll(1)}>&#8594;</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedProperties;