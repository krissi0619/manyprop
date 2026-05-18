import React, { useState } from 'react';
import HeroSection from '../components/Home/HeroSection';
import QuickStats from '../components/Home/QuickStats';
import RecommendedProperties from '../components/Home/RecommendedProperties';
import TrendingProperties from '../components/Home/TrendingProperties';
import FeaturedProjects from '../components/Home/FeaturedProjects';
import PropertyTypes from '../components/Home/PropertyTypes';
import PopularCities from '../components/Home/PopularCities';
import WhyChoose from '../components/Home/WhyChoose';
import ToolsSection from '../components/Home/ToolsSection';
import NewsSection from '../components/Home/NewsSection';
import SEO from '../components/Common/SEO';
import './Home.css';

const Home = () => {
  // Shared search state — HeroSection updates this; property sections consume it
  const [searchState, setSearchState] = useState({
    tab: 'BUY',          // BUY | RENT | COMMERCIAL | PG | PLOTS | PROJECTS
    propertyFilter: 'All Flat', // pill dropdown value
    city: '',
  });

  const handleSearchChange = (newState) => {
    setSearchState(prev => ({ ...prev, ...newState }));
  };

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "ManyProp",
        "url": "https://manyprop.onrender.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://manyprop.onrender.com/properties?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "ManyProp Real Estate Platform",
        "url": "https://manyprop.onrender.com",
        "logo": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-98765-43210",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["en", "hi"]
        }
      }
    ]
  };

  return (
    <div className="home">
      <SEO 
        title="Find Flats, Villas, Apartments for Sale & Rent"
        description="Search real estate properties in Pune, Baben, Lokhanda and major Indian cities. ManyProp brings you 100% verified owner listings, direct builder contacts, and zero brokerage."
        keywords="verified apartments Pune, villas for sale, rent flats in Baben Lokhanda, zero brokerage property website, buy house India, ManyProp search"
        schema={homeSchema}
      />
      <HeroSection searchState={searchState} onSearchChange={handleSearchChange} />
      <QuickStats />
      <RecommendedProperties searchState={searchState} />
      <TrendingProperties searchState={searchState} />
      <FeaturedProjects />
      <PropertyTypes />
      <PopularCities />
      <WhyChoose />
      <ToolsSection />
      <NewsSection />
    </div>
  );
};

export default Home;