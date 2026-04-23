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