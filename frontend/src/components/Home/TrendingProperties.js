import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HomePropertyCard from '../Common/HomePropertyCard';
import { API_PROPERTIES } from '../../api/config';
import './RecommendedProperties.css';
import './TrendingProperties.css';

/* ── All mock trending properties covering buy & rent ── */
const ALL_MOCK_TRENDING = [
  { _id: '10', title: 'Premium Apartment in Central Delhi', price: 7500000,  priceType: 'sale', propertyType: 'apartment', address: { city: 'Noida', state: 'New Delhi' },     details: { bedrooms: 3, area: 750,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'], trending: true },
  { _id: '11', title: 'Modern Villa in South Delhi',        price: 7500000,  priceType: 'sale', propertyType: 'villa',      address: { city: 'Noida', state: 'New Delhi' },     details: { bedrooms: 3, area: 750,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'], trending: true, verified: true },
  { _id: '12', title: 'Luxury Apartment with City View',   price: 7500000,  priceType: 'sale', propertyType: 'apartment', address: { city: 'Noida', state: 'New Delhi' },     details: { bedrooms: 3, area: 750,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80'], trending: true },
  { _id: '13', title: 'Spacious 3BHK Apartment',          price: 8200000,  priceType: 'sale', propertyType: 'apartment', address: { city: 'Delhi', state: 'Delhi' },          details: { bedrooms: 3, area: 750,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'], trending: true },
  { _id: '14', title: 'Penthouse Apartment in Gurgaon',   price: 15500000, priceType: 'sale', propertyType: 'apartment', address: { city: 'Gurgaon', state: 'Haryana' },      details: { bedrooms: 4, area: 3200, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'], trending: true, verified: true },
  { _id: '15', title: 'Independent House in Dwarka',      price: 9500000,  priceType: 'sale', propertyType: 'house',      address: { city: 'Dwarka', state: 'Delhi' },        details: { bedrooms: 3, area: 1800, areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'], trending: true },
  // Rent
  { _id: '16', title: 'Trendy 2BHK Rental Apartment',    price: 25000,    priceType: 'rent', propertyType: 'apartment', address: { city: 'Bangalore', state: 'Karnataka' }, details: { bedrooms: 2, area: 650,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80'], trending: true },
  { _id: '17', title: 'Fully Furnished Studio for Rent', price: 18000,    priceType: 'rent', propertyType: 'apartment', address: { city: 'Pune', state: 'Maharashtra' },   details: { bedrooms: 1, area: 400,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'], trending: true },
  { _id: '18', title: 'PG Hostel Near Metro',            price: 7500,     priceType: 'rent', propertyType: 'pg',        address: { city: 'Delhi', state: 'Delhi' },         details: { bedrooms: 1, area: 180,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'], trending: true },
  { _id: '19', title: 'Prime Commercial Rental Office',  price: 55000,    priceType: 'rent', propertyType: 'commercial', address: { city: 'Mumbai', state: 'Maharashtra' }, details: { bedrooms: 0, area: 1200,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'], trending: true },
  { _id: '20', title: 'Plot in Emerging Locality',       price: 1800000,  priceType: 'sale', propertyType: 'plot',      address: { city: 'Noida', state: 'New Delhi' },    details: { bedrooms: 0, area: 1200,  areaUnit: 'sqft' }, images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'], trending: true },
];

const filterMock = (searchState) => {
  const tab = (searchState?.tab || 'BUY').toUpperCase();
  if (tab === 'RENT')       return ALL_MOCK_TRENDING.filter(p => p.priceType === 'rent');
  if (tab === 'PG')         return ALL_MOCK_TRENDING.filter(p => p.propertyType === 'pg');
  if (tab === 'COMMERCIAL') return ALL_MOCK_TRENDING.filter(p => p.propertyType === 'commercial');
  if (tab === 'PLOTS')      return ALL_MOCK_TRENDING.filter(p => p.propertyType === 'plot');
  return ALL_MOCK_TRENDING.filter(p => p.priceType === 'sale');
};

const getTrendingLabel = (tab) => {
  switch ((tab || 'BUY').toUpperCase()) {
    case 'RENT':       return { pre: 'Trending', highlight: 'Rental', post: 'Properties' };
    case 'PG':         return { pre: 'Trending', highlight: 'PG & Hostels', post: 'Near You' };
    case 'COMMERCIAL': return { pre: 'Trending', highlight: 'Commercial', post: 'Spaces' };
    case 'PLOTS':      return { pre: 'Trending', highlight: 'Plots', post: '& Land Deals' };
    case 'PROJECTS':   return { pre: 'Trending', highlight: 'New Projects', post: 'Launching Soon' };
    default:           return { pre: 'Trending', highlight: 'Properties', post: 'in Delhi' };
  }
};

const TrendingProperties = ({ searchState }) => {
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
        const params = new URLSearchParams();
        params.set('trending', 'true');
        params.set('limit', '6');

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

  const label = getTrendingLabel(activeTab);

  const buildExploreUrl = () => {
    const params = new URLSearchParams();
    if (activeTab === 'RENT')            { params.set('operation', 'rent'); }
    else if (activeTab === 'PG')         { params.set('propertyType', 'pg'); }
    else if (activeTab === 'COMMERCIAL') { params.set('propertyType', 'commercial'); }
    else if (activeTab === 'PLOTS')      { params.set('propertyType', 'plot'); }
    else if (activeTab === 'PROJECTS')   { params.set('propertyType', 'project'); }
    else                                 { params.set('operation', 'buy'); }
    return `/properties?${params.toString()}`;
  };

  return (
    <section className="trending-properties">
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
                    No trending properties found. Try a different filter.
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

export default TrendingProperties;