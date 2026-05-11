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

  return (
    <div className="home">
      <SEO 
        title="Find Flats, Villas, Apartments for Sale & Rent"
        description="Search real estate properties in Pune, Baben, Lokhanda and major Indian cities. ManyProp brings you 100% verified owner listings, direct builder contacts, and zero brokerage."
        keywords="verified apartments Pune, villas for sale, rent flats in Baben Lokhanda, zero brokerage property website, buy house India, ManyProp search"
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