import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaSearch, FaTimes, FaChevronDown,
  FaMapMarkerAlt, FaList, FaMap, FaBed, FaBath,
  FaRulerCombined, FaRupeeSign, FaFilter, FaSlidersH
} from 'react-icons/fa';
import PropertyCard from '../components/Common/PropertyCard';
import FilterSidebar from '../components/Properties/FilterSidebar';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_PROPERTIES } from '../api/config';
import './Properties.css';

/* Fix leaflet marker icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/* Custom price marker icon */
const createPriceIcon = (price, isActive) => {
  const label = price >= 10000000
    ? `₹${(price / 10000000).toFixed(1)}Cr`
    : price >= 100000
      ? `₹${(price / 100000).toFixed(0)}L`
      : `₹${(price / 1000).toFixed(0)}k/mo`;
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${isActive ? '#0a0a0a' : '#fff'};
      color:${isActive ? '#fff' : '#0a0a0a'};
      border:2px solid #0a0a0a;
      padding:4px 10px;
      border-radius:999px;
      font-size:11px;
      font-weight:800;
      font-family:Inter,sans-serif;
      white-space:nowrap;
      box-shadow:0 2px 10px rgba(0,0,0,0.25);
      cursor:pointer;
    ">${label}</div>`,
    iconSize: [null, null],
    iconAnchor: [30, 14],
  });
};

/* ── Mock fallback data ── */
const MOCK_PROPERTIES = [
  { _id: 'm1', title: 'Kinshu Homes', price: 4500000, priceType: 'sale', propertyType: 'flat', constructionStatus: 'Under Construction', postedBy: 'Builder', furnished: 'Furnished', isVerified: true, bhkTypes: ['2 BHK'], address: { locality: 'Sector 17', city: 'Chandigarh' }, details: { bedrooms: 2, bathrooms: 2, area: 1200, furnished: 'Furnished' }, amenities: ['Gym', 'Parking'], agentContact: { name: 'Kinshu Builders', phone: '+91 9876543212' }, images: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80'] },
  { _id: 'm2', title: 'Siddhi Residency', price: 7500000, priceType: 'sale', propertyType: 'apartment', constructionStatus: 'Ready To Move', postedBy: 'Owner', furnished: 'Semi-Furnished', isVerified: true, bhkTypes: ['3 BHK'], address: { locality: 'Sector 22', city: 'Chandigarh' }, details: { bedrooms: 3, bathrooms: 2, area: 1450, furnished: 'Semi-Furnished' }, amenities: ['Lift', 'Security'], agentContact: { name: 'Self (Owner)', phone: '+91 9823456789' }, images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'] },
  { _id: 'm3', title: 'Green Valley Villa', price: 12000000, priceType: 'sale', propertyType: 'villa', constructionStatus: 'Ready To Move', postedBy: 'Owner', furnished: 'Furnished', isVerified: false, bhkTypes: ['4 BHK'], address: { locality: 'Baner', city: 'Pune' }, details: { bedrooms: 4, bathrooms: 3, area: 2200, furnished: 'Furnished' }, amenities: ['Gym', 'Pool', 'Parking'], agentContact: { name: 'Green Realty', phone: '+91 9876543000' }, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'] },
  { _id: 'm4', title: 'Sky Heights 3BHK', price: 32000, priceType: 'rent', propertyType: 'apartment', constructionStatus: 'Ready To Move', postedBy: 'Dealer', furnished: 'Semi-Furnished', isVerified: true, bhkTypes: ['3 BHK'], address: { locality: 'Wakad', city: 'Pune' }, details: { bedrooms: 3, bathrooms: 2, area: 900, furnished: 'Semi-Furnished' }, amenities: ['Parking', 'Security'], agentContact: { name: 'Sky Properties', phone: '+91 9988776655' }, images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'] },
  { _id: 'm5', title: 'Royal Palms', price: 9500000, priceType: 'sale', propertyType: 'villa', constructionStatus: 'New Launch', postedBy: 'Builder', furnished: 'Unfurnished', isVerified: true, bhkTypes: ['3 BHK', '4 BHK'], address: { locality: 'Hinjewadi', city: 'Pune' }, details: { bedrooms: 3, bathrooms: 3, area: 1800, furnished: 'Unfurnished' }, amenities: ['Gym', 'Garden', 'Clubhouse'], agentContact: { name: 'Royal Properties', phone: '+91 9876500123' }, images: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80'] },
  { _id: 'm6', title: 'Lotus Residency 2BHK', price: 18000, priceType: 'rent', propertyType: 'apartment', constructionStatus: 'Ready To Move', postedBy: 'Owner', furnished: 'Furnished', isVerified: true, bhkTypes: ['2 BHK'], address: { locality: 'Kothrud', city: 'Pune' }, details: { bedrooms: 2, bathrooms: 1, area: 780, furnished: 'Furnished' }, amenities: ['Lift', 'CCTV'], agentContact: { name: 'Rajesh Joshi', phone: '+91 9823001234' }, images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80'] },
  { _id: 'm7', title: 'The Grand PG Residency', price: 8000, priceType: 'rent', propertyType: 'pg', constructionStatus: 'Ready To Move', postedBy: 'Owner', furnished: 'Furnished', isVerified: false, bhkTypes: ['1 BHK'], address: { locality: 'Koregaon Park', city: 'Pune' }, details: { bedrooms: 1, bathrooms: 1, area: 300, furnished: 'Furnished' }, amenities: ['WiFi', 'Security'], agentContact: { name: 'PG Incharge', phone: '+91 9812345670' }, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'] },
  { _id: 'm8', title: 'Sunrise Plot 200sqyd', price: 2500000, priceType: 'sale', propertyType: 'plot', constructionStatus: 'New Launch', postedBy: 'Dealer', furnished: 'Unfurnished', isVerified: true, bhkTypes: [], address: { locality: 'Undri', city: 'Pune' }, details: { bedrooms: 0, bathrooms: 0, area: 1800, furnished: 'Unfurnished' }, amenities: [], agentContact: { name: 'Sunrise Realtors', phone: '+91 9800001234' }, images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'] },
];

/* ─── Client-side filter for mock / offline mode ─── */
const applyClientFilters = (data, filters, priceType, cityInput, skipCityFilter = false) => {
  let result = [...data];

  // City filter — skipped on mock fallback so users always see results
  if (!skipCityFilter && cityInput && cityInput.trim()) {
    const c = cityInput.trim().toLowerCase();
    result = result.filter(p =>
      p.address?.city?.toLowerCase().includes(c) ||
      p.address?.locality?.toLowerCase().includes(c)
    );
  }

  // Buy / Rent
  if (priceType === 'rent') result = result.filter(p => p.priceType === 'rent');
  else result = result.filter(p => p.priceType === 'sale');

  // Verified
  if (filters.isVerified) result = result.filter(p => p.isVerified === true);

  // Max price
  if (filters.maxPrice) result = result.filter(p => p.price <= filters.maxPrice);
  // Min price
  if (filters.minPrice) result = result.filter(p => p.price >= filters.minPrice);

  // Property type (map label → backend value)
  if (filters.propertyType) {
    const typeMap = {
      'Flat': 'flat', 'Apartment': 'apartment', 'Villa': 'villa',
      'Farm': 'farm', 'PG': 'pg', 'Plot': 'plot',
      'Commercial': 'commercial', 'Project': 'project',
      'Bungalow': 'luxury_bungalow', 'Independent House': 'independent_house',
    };
    const target = (typeMap[filters.propertyType] || filters.propertyType.toLowerCase().replace(/ /g, '_'));
    result = result.filter(p => p.propertyType?.toLowerCase().replace(/ /g, '_') === target);
  }

  // BHK type
  if (filters.bhkType) {
    const num = parseInt(filters.bhkType);
    if (!isNaN(num)) result = result.filter(p =>
      p.details?.bedrooms === num ||
      (p.bhkTypes || []).some(b => parseInt(b) === num)
    );
  }

  // Furnished
  if (filters.furnished) {
    const target = filters.furnished;
    result = result.filter(p =>
      p.furnished === target ||
      p.details?.furnished === target
    );
  }

  // Construction status
  if (filters.constructionStatus) {
    result = result.filter(p => p.constructionStatus === filters.constructionStatus);
  }

  // Posted by — map Dealer/Broker/Developer labels
  if (filters.postedBy) {
    const postedByMap = { 'Dealer': 'Dealer', 'Broker': 'Dealer', 'Developer': 'Builder', 'Owner': 'Owner' };
    const target = postedByMap[filters.postedBy] || filters.postedBy;
    result = result.filter(p => p.postedBy === target || p.postedBy === filters.postedBy);
  }

  // Amenities (all selected must be present)
  if ((filters.amenities || []).length > 0) {
    result = result.filter(p =>
      filters.amenities.every(a => (p.amenities || []).map(x => x.toLowerCase()).includes(a.toLowerCase()))
    );
  }

  // Property age (year-based — mock data does not have this field, skip silently)
  // reraType and sortNearby are display-only for mock data

  return result;
};

const sortProperties = (data, sortBy) => {
  const arr = [...data];
  if (sortBy === 'price_asc') return arr.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') return arr.sort((a, b) => b.price - a.price);
  if (sortBy === 'area_desc') return arr.sort((a, b) => (b.details?.area || 0) - (a.details?.area || 0));
  return arr; // newest first by default
};

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Area: Largest First', value: 'area_desc' },
];

const TOP_FILTERS = [
  { label: 'New Launch', key: 'constructionStatus', val: 'New Launch' },
  { label: 'Owner', key: 'postedBy', val: 'Owner' },
  { label: 'Verified', key: 'isVerified', val: true },
  { label: 'Ready to Move', key: 'constructionStatus', val: 'Ready To Move' },
  { label: 'Under Const.', key: 'constructionStatus', val: 'Under Construction' },
  { label: 'Dealer', key: 'postedBy', val: 'Dealer' },
  { label: 'Furnished', key: 'furnished', val: 'Furnished' },
  { label: 'PG', key: 'propertyType', val: 'PG' },
];

/* ─── Area click handler ─── */
function AreaClickHandler({ onAreaClick }) {
  useMapEvents({ click(e) { onAreaClick(e.latlng); } });
  return null;
}

/* ─── Map Search Box ─── */
const MapSearchBox = () => {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      if (res.data && res.data.length > 0) {
        const { lat, lon } = res.data[0];
        map.flyTo([lat, lon], 13);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Failed to search location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-search-box" style={{
      position: 'absolute',
      top: '12px',
      left: '52px',
      zIndex: 1000,
      background: '#fff',
      padding: '6px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', margin: 0 }}>
        <input 
          type="text" 
          placeholder="Search location in map..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '6px', 
            padding: '8px 12px', 
            outline: 'none',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            width: '220px'
          }}
        />
        <button type="submit" style={{ 
          background: '#ea580c', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          padding: '8px 16px', 
          cursor: 'pointer', 
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {loading ? '...' : <FaSearch />}
        </button>
      </form>
    </div>
  );
};

/* ─── Advanced Search Panel ─── */
const AdvancedSearchPanel = ({ initialCity, initialType, onSearch }) => {
  const [city, setCity] = useState(initialCity || '');
  const [type, setType] = useState(initialType || 'buy');
  const [bhk, setBhk] = useState('');
  const [propType, setPropType] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [furnished, setFurnished] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Sync if parent changes (e.g. from URL)
  useEffect(() => { setCity(initialCity || ''); }, [initialCity]);
  useEffect(() => { setType(initialType || 'buy'); }, [initialType]);

  const handleSearch = () => {
    onSearch({
      city: city.trim(),
      priceType: type,
      bhkType: bhk || null,
      propertyType: propType || null,
      maxPrice: budgetMax ? Number(budgetMax) * 100000 : null,
      minPrice: budgetMin ? Number(budgetMin) * 100000 : null,
      furnished: furnished || null,
    });
  };

  return (
    <div className="adv-search-panel">
      <div className="adv-search-header">
        <div className="adv-type-toggle">
          {['buy', 'rent'].map(t => (
            <button key={t} className={`adv-type-btn ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
              {t === 'buy' ? '🏠 Buy' : '🔑 Rent'}
            </button>
          ))}
        </div>
      </div>

      <div className="adv-search-row">
        <div className="adv-field adv-field-wide">
          <label className="adv-label">Location / City</label>
          <div className="adv-input-wrap">
            <FaMapMarkerAlt className="adv-input-icon" />
            <input
              type="text"
              placeholder="e.g. Chandigarh, Mumbai, Pune..."
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="adv-input"
            />
            {city && (
              <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }} onClick={() => setCity('')}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="adv-field">
          <label className="adv-label">Max Budget (Lakhs)</label>
          <div className="adv-input-wrap">
            <FaRupeeSign className="adv-input-icon" />
            <input type="number" placeholder="e.g. 80" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className="adv-input" min="0" />
          </div>
        </div>

        <div className="adv-field">
          <label className="adv-label">BHK</label>
          <select value={bhk} onChange={e => setBhk(e.target.value)} className="adv-select">
            <option value="">Any BHK</option>
            {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="adv-field adv-search-btn-wrap">
          <button className="adv-search-btn" onClick={handleSearch}>
            <FaSearch /> Search Properties
          </button>
        </div>
      </div>

      <div className="adv-more-row">
        <button className="adv-more-toggle" onClick={() => setExpanded(!expanded)}>
          <FaFilter style={{ fontSize: '0.75rem' }} />
          {expanded ? 'Hide' : 'More'} Filters
          <FaChevronDown style={{ fontSize: '0.68rem', transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>

        {expanded && (
          <div className="adv-extra-filters">
            <div className="adv-field">
              <label className="adv-label">Property Type</label>
              <select value={propType} onChange={e => setPropType(e.target.value)} className="adv-select">
                <option value="">Any Type</option>
                {['Flat', 'Apartment', 'Villa', 'Farm', 'Independent House', 'Luxury Bungalow', 'PG', 'Plot', 'Commercial', 'Project'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="adv-field">
              <label className="adv-label">Furnished Status</label>
              <select value={furnished} onChange={e => setFurnished(e.target.value)} className="adv-select">
                <option value="">Any</option>
                {['Furnished', 'Semi-Furnished', 'Unfurnished'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="adv-field">
              <label className="adv-label">Min Budget (Lakhs)</label>
              <div className="adv-input-wrap">
                <FaRupeeSign className="adv-input-icon" />
                <input type="number" placeholder="e.g. 20" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="adv-input" min="0" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Properties Component
   ══════════════════════════════════════════════════════════════ */
const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial propertyType from URL (set by HeroSection tabs like PG, PLOTS, etc.)
  const initialPropertyType = searchParams.get('propertyType') || null;
  const initialOperation = searchParams.get('operation') || null;

  // Single source of truth for city & type (drives the fetch)
  const [cityInput, setCityInput] = useState(
    searchParams.get('search') || searchParams.get('city') || 'Pune'
  );
  const [priceType, setPriceType] = useState(() => {
    if (initialOperation === 'rent') return 'rent';
    if (searchParams.get('type') === 'rent') return 'rent';
    return 'buy';
  });

  const [filters, setFilters] = useState({
    isVerified: false,
    maxPrice: null,   // null = no limit
    minPrice: null,
    propertyType: initialPropertyType,
    bhkType: null,
    amenities: [],
    constructionStatus: null,
    furnished: null,
    postedBy: null,
    sortBy: 'newest',
    propertyAge: null,
    reraType: null,
    sortNearby: null,
    bhkAminities: [],
    bhkAmMore: false,
  });

  const [activeChips, setActiveChips] = useState(new Set());
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState(searchParams.get('viewMode') === 'map' ? 'map' : 'list');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Map state
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);
  const [areaSearchCenter, setAreaSearchCenter] = useState(null);

  /* ─── Build API query string from all active state ─── */
  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();

    // Always use city= (not search=) — simpler and consistent
    if (cityInput.trim()) p.set('city', cityInput.trim());

    if (priceType === 'rent') p.set('priceType', 'rent');
    if (filters.isVerified) p.set('isVerified', 'true');
    if (filters.maxPrice) p.set('maxPrice', String(filters.maxPrice));
    if (filters.minPrice) p.set('minPrice', String(filters.minPrice));

    // Map display labels → backend enum values for propertyType
    if (filters.propertyType) {
      const typeMap = {
        'Flat': 'flat',
        'Apartment': 'apartment',
        'Villa': 'villa',
        'Farm': 'farm',
        'Independent House': 'independent_house',
        'Luxury Bungalow': 'luxury_bungalow',
        'PG': 'pg',
        'Plot': 'plot',
        'Commercial': 'commercial',
        'Project': 'project',
      };
      // If it's already a backend value (lowercase), use it directly
      const backendType = typeMap[filters.propertyType] || filters.propertyType.toLowerCase().replace(/ /g, '_');
      p.set('propertyType', backendType);
    }

    // BHK → bedrooms number
    if (filters.bhkType) {
      const num = parseInt(filters.bhkType);
      if (!isNaN(num)) p.set('bedrooms', String(num));
    }

    if (filters.constructionStatus) p.set('constructionStatus', filters.constructionStatus);

    // furnished: map "Furnished" → "fully_furnished" etc.
    if (filters.furnished) {
      const furnishMap = {
        'Furnished': 'fully_furnished',
        'Semi-Furnished': 'semi_furnished',
        'Unfurnished': 'unfurnished',
      };
      p.set('furnished', furnishMap[filters.furnished] || filters.furnished.toLowerCase());
    }

    if (filters.postedBy) p.set('postedBy', filters.postedBy);
    if ((filters.amenities || []).length > 0) p.set('amenities', filters.amenities.join(','));

    p.set('limit', '50');
    return p.toString();
  }, [cityInput, priceType, filters]);

  /* ─── Fetch properties from backend ─── */
  useEffect(() => {
    let cancelled = false;
    const fetchProperties = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const qs = buildQuery();
        const res = await axios.get(`${API_PROPERTIES}?${qs}`, { timeout: 8000 });
        if (cancelled) return;

        let data = res.data.properties || [];

        // Client-side sort
        if (filters.sortBy === 'price_asc') data = [...data].sort((a, b) => a.price - b.price);
        if (filters.sortBy === 'price_desc') data = [...data].sort((a, b) => b.price - a.price);
        if (filters.sortBy === 'area_desc') data = [...data].sort((a, b) => (b.details?.area || 0) - (a.details?.area || 0));

        if (data.length === 0) {
          // Backend returned empty — show filtered mock as fallback (skip city filter so results always show)
          const filtered = applyClientFilters(MOCK_PROPERTIES, filters, priceType, cityInput, true);
          const sorted = sortProperties(filtered, filters.sortBy);
          setProperties(sorted);
          setUsingMock(true);
          setTotal(sorted.length);
        } else {
          setProperties(data);
          setUsingMock(false);
          setTotal(res.data.total || data.length);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Properties fetch error:', err.message);
        // Backend offline → use mock with client-side filters applied (skip city filter)
        const filtered = applyClientFilters(MOCK_PROPERTIES, filters, priceType, cityInput, true);
        const sorted = sortProperties(filtered, filters.sortBy);
        setProperties(sorted);
        setUsingMock(true);
        setTotal(sorted.length);
        setErrorMsg('Could not connect to backend. Showing sample data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildQuery]);

  /* ─── Coordinates for map markers ─── */
  const getCoordinates = (p, idx) => {
    if (p.address?.coordinates?.lat) return [p.address.coordinates.lat, p.address.coordinates.lng];
    if (p.address?.lat) return [p.address.lat, p.address.lng];
    const baseLat = 18.5204, baseLng = 73.8567;
    return [baseLat + (idx * 0.015) * (idx % 2 === 0 ? 1 : -1), baseLng + (idx * 0.012) * (idx % 3 === 0 ? 1 : -1)];
  };

  /* ─── Handlers ─── */
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Called by AdvancedSearchPanel "Search" button
  const handleAdvancedSearch = (params) => {
    if (params.city !== undefined) setCityInput(params.city || 'Pune');
    if (params.priceType) setPriceType(params.priceType);

    const newFilters = {};
    if (params.bhkType !== undefined) newFilters.bhkType = params.bhkType;
    if (params.propertyType !== undefined) newFilters.propertyType = params.propertyType;
    if (params.maxPrice !== undefined) newFilters.maxPrice = params.maxPrice;
    if (params.minPrice !== undefined) newFilters.minPrice = params.minPrice;
    if (params.furnished !== undefined) newFilters.furnished = params.furnished;
    setFilters(prev => ({ ...prev, ...newFilters }));

    // Update URL params
    const urlParams = {};
    if (params.city) urlParams.city = params.city;
    if (params.priceType) urlParams.type = params.priceType;
    setSearchParams(urlParams);
  };

  const handlePriceTypeChange = (pt) => {
    setPriceType(pt);
    setSearchParams({ city: cityInput, type: pt });
  };

  const toggleChip = (chip) => {
    const next = new Set(activeChips);
    if (next.has(chip.label)) {
      next.delete(chip.label);
      // Reset that specific filter
      if (chip.key === 'isVerified') setFilters(prev => ({ ...prev, isVerified: false }));
      else setFilters(prev => ({ ...prev, [chip.key]: null }));
    } else {
      next.add(chip.label);
      if (chip.key === 'isVerified') setFilters(prev => ({ ...prev, isVerified: true }));
      else setFilters(prev => ({ ...prev, [chip.key]: chip.val }));
    }
    setActiveChips(next);
  };

  const clearAllFilters = () => {
    setActiveChips(new Set());
    setAreaSearchCenter(null);
    setFilters({
      isVerified: false, maxPrice: null, minPrice: null,
      propertyType: null, bhkType: null, amenities: [],
      constructionStatus: null, furnished: null, postedBy: null, sortBy: 'newest',
      propertyAge: null, reraType: null, sortNearby: null, bhkAminities: [], bhkAmMore: false,
    });
  };

  const activeFCount = [
    filters.isVerified, filters.propertyType, filters.bhkType, filters.furnished,
    filters.constructionStatus, filters.postedBy,
    filters.maxPrice, filters.minPrice,
    (filters.amenities || []).length > 0
  ].filter(Boolean).length;

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label || 'Sort';

  const formatPrice = (p) => {
    if (!p) return '';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(0)}L`;
    return `₹${p.toLocaleString()}/mo`;
  };

  // Filter properties by distance if areaSearchCenter is active
  const displayedProperties = React.useMemo(() => {
    if (!areaSearchCenter) return properties;
    return properties.filter((p, idx) => {
      const coords = getCoordinates(p, idx);
      const distance = L.latLng(coords[0], coords[1]).distanceTo(areaSearchCenter);
      return distance <= 2000; // 2km radius
    });
  }, [properties, areaSearchCenter]);

  return (
    <div className="properties-page">
      {/* NEW TOP SEARCH PILL BAR */}
      <div className="design-top-search-bar">
        <div className="design-search-pill">
          <select 
            className="design-pill-select"
            value={priceType}
            onChange={(e) => handlePriceTypeChange(e.target.value)}
          >
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <div className="design-pill-divider" />
          <div className="design-pill-input-wrap">
            <FaSearch className="design-pill-icon" />
            <input 
              type="text" 
              placeholder="Flats in delhi" 
              className="design-pill-input"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchParams({ search: cityInput, type: priceType }); }}
            />
          </div>
          <div className="design-pill-divider" />
          <select className="design-pill-select">
            <option>Top localities</option>
          </select>
          <div className="design-pill-divider" />
          <select 
            className="design-pill-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
          >
            <option value="newest">Sort By</option>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="design-pill-btn" onClick={() => setSearchParams({ search: cityInput, type: priceType })}>
            <FaSearch style={{ marginRight: '6px' }} /> Search
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="design-hero-section">
        <h1>Find 20+ Properties in {cityInput || 'Pune'}</h1>
        <div className="design-breadcrumb">
          <strong>Home</strong> &gt; <span>Property In {cityInput || 'Pune'}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="listing-container">
        <button className="mobile-filter-btn design-mobile-filter" onClick={() => setShowFilters(true)}>
          <FaFilter /> Filters
          {activeFCount > 0 && <span className="mobile-filter-count">{activeFCount}</span>}
        </button>
        <div className="listing-main-content">
          {/* ── Sidebar ── */}
          <div className={`sidebar-col ${showFilters ? 'mobile-open' : ''}`}>
            {showFilters && <div className="mobile-sidebar-backdrop" onClick={() => setShowFilters(false)} />}
            <div className="sidebar-inner">
              {showFilters && (
                <button className="mobile-sidebar-close" onClick={() => setShowFilters(false)}>
                  <FaTimes /> Close Filters
                </button>
              )}
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAllFilters}
                priceType={priceType}
                onPriceTypeChange={handlePriceTypeChange}
              />
            </div>
          </div>

          {/* ── Results ── */}
          <div className="results-col">
            {/* Horizontal Top Filters */}
            <div className="design-top-chips">
              {TOP_FILTERS.map(chip => {
                const isActive = activeChips.has(chip.label);
                return (
                  <button
                    key={chip.label}
                    className={`design-chip ${isActive ? 'active' : ''}`}
                    onClick={() => toggleChip(chip)}
                  >
                    {isActive && chip.label === 'Under Const.' ? <span><FaTimes style={{marginRight: 4, fontSize:'0.7rem'}}/> Under Construction</span> : chip.label === 'Under Const.' ? 'Under Construction' : chip.label}
                  </button>
                );
              })}
              {activeChips.size > 0 && (
                <button className="design-chip chip-clear" onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
            </div>
            {loading ? (
              <div className="listing-loading">
                <div className="spinner" />
                <p>Searching properties in <strong>{cityInput}</strong>...</p>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="error-notice">⚠️ {errorMsg}</div>
                )}
                {usingMock && !errorMsg && (
                  <div className="mock-notice">
                    📡 No results found for <strong>"{cityInput}"</strong> — showing sample data. Try a different city or check your connection.
                  </div>
                )}

                {/* Results header row */}
                <div className="results-header">
                  <div className="results-header-left">
                    <span className="results-count">
                      <strong>{properties.length}</strong> {properties.length === 1 ? 'property' : 'properties'} found
                      {cityInput && <> in <strong>{cityInput}</strong></>}
                      {priceType === 'rent' ? ' for rent' : ' for sale'}
                    </span>
                    {areaSearchCenter && (
                      <span className="area-search-badge">
                        <FaMapMarkerAlt /> Within 2km of map selection
                        <button onClick={() => setAreaSearchCenter(null)}>×</button>
                      </span>
                    )}
                  </div>

                  {/* Active filter badges */}
                  {(filters.propertyType || filters.bhkType || filters.isVerified || filters.furnished || filters.maxPrice || filters.constructionStatus || filters.postedBy) && (
                    <div className="active-filter-badges">
                      {filters.propertyType && <span className="act-badge">{filters.propertyType} <button onClick={() => handleFilterChange({ propertyType: null })}>×</button></span>}
                      {filters.bhkType && <span className="act-badge">{filters.bhkType} <button onClick={() => handleFilterChange({ bhkType: null })}>×</button></span>}
                      {filters.isVerified && <span className="act-badge">Verified <button onClick={() => handleFilterChange({ isVerified: false })}>×</button></span>}
                      {filters.furnished && <span className="act-badge">{filters.furnished} <button onClick={() => handleFilterChange({ furnished: null })}>×</button></span>}
                      {filters.constructionStatus && <span className="act-badge">{filters.constructionStatus} <button onClick={() => handleFilterChange({ constructionStatus: null })}>×</button></span>}
                      {filters.postedBy && <span className="act-badge">By {filters.postedBy} <button onClick={() => handleFilterChange({ postedBy: null })}>×</button></span>}
                      {filters.maxPrice && <span className="act-badge">Max {formatPrice(filters.maxPrice)} <button onClick={() => handleFilterChange({ maxPrice: null })}>×</button></span>}
                      <button className="act-clear-all" onClick={clearAllFilters}>Clear all</button>
                    </div>
                  )}
                </div>

                {/* ── LIST VIEW ── */}
                {viewMode === 'list' && (
                  <div className="properties-list">
                    {properties.length > 0
                      ? properties.map(property => (
                          <div
                            key={property._id}
                            onMouseEnter={() => setHoveredId(property._id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <PropertyCard property={property} />
                          </div>
                        ))
                      : (
                        <div className="no-results">
                          <div className="no-results-icon">🏘️</div>
                          <h3>No properties found in "{cityInput}"</h3>
                          <p>Try a different city, adjust your budget, or remove some filters.</p>
                          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="no-results-btn" onClick={clearAllFilters}>Reset Filters</button>
                            <button className="no-results-btn" style={{ background: '#fff', color: '#0a0a0a', border: '1.5px solid #0a0a0a' }} onClick={() => navigate('/post-property')}>Post a Property</button>
                          </div>
                        </div>
                      )
                    }
                  </div>
                )}

                {/* ── MAP VIEW ── */}
                {viewMode === 'map' && (
                  <div className="map-view-wrapper">
                    <div className="map-info-bar">
                      <span>
                        <FaMapMarkerAlt style={{ color: '#0a0a0a', marginRight: 4 }} />
                        <strong>{displayedProperties.length}</strong> properties on map
                      </span>
                      {areaSearchCenter ? (
                        <button className="area-clear-btn" onClick={() => setAreaSearchCenter(null)}>
                          <FaTimes /> Clear Area Selection
                        </button>
                      ) : (
                        <span className="map-hint">💡 Click anywhere on the map to filter by area</span>
                      )}
                    </div>

                    <div className="map-split">
                      <div className="map-container">
                        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                          <TileLayer
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapSearchBox />
                          <AreaClickHandler onAreaClick={setAreaSearchCenter} />
                          {areaSearchCenter && (
                            <Circle
                              center={areaSearchCenter}
                              radius={2000}
                              pathOptions={{ color: '#0a0a0a', fillColor: '#0a0a0a', fillOpacity: 0.05, weight: 2, dashArray: '6,4' }}
                            />
                          )}
                          {displayedProperties.map((p, idx) => (
                            <Marker
                              key={p._id}
                              position={getCoordinates(p, properties.indexOf(p))}
                              icon={createPriceIcon(p.price, hoveredId === p._id || selectedProp?._id === p._id)}
                              eventHandlers={{
                                click: () => setSelectedProp(p),
                                mouseover: () => setHoveredId(p._id),
                                mouseout: () => setHoveredId(null),
                              }}
                            >
                              <Popup>
                                <div className="map-popup">
                                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
                                  <div className="popup-body">
                                    <div className="popup-title">{p.title}</div>
                                    <div className="popup-loc"><FaMapMarkerAlt />{p.address?.locality}, {p.address?.city}</div>
                                    <div className="popup-price">{formatPrice(p.price)}</div>
                                    <div className="popup-specs">
                                      {p.details?.bedrooms && <span><FaBed />{p.details.bedrooms}bd</span>}
                                      {p.details?.bathrooms && <span><FaBath />{p.details.bathrooms}ba</span>}
                                      {p.details?.area && <span><FaRulerCombined />{p.details.area}sqft</span>}
                                    </div>
                                    <button className="popup-view-btn" onClick={() => navigate(`/property/${p._id}`)}>
                                      View Details →
                                    </button>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      </div>

                      {/* Map sidebar */}
                      <div className="map-prop-list">
                        <div className="map-prop-list-header">
                          Properties ({displayedProperties.length})
                          {areaSearchCenter && <span className="map-area-tag">Near selected</span>}
                        </div>
                        {displayedProperties.length === 0 ? (
                          <div className="map-no-results">No properties in this area</div>
                        ) : displayedProperties.map(p => (
                          <div
                            key={p._id}
                            className={`map-prop-card ${hoveredId === p._id ? 'hovered' : ''} ${selectedProp?._id === p._id ? 'selected' : ''}`}
                            onMouseEnter={() => setHoveredId(p._id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedProp(p)}
                          >
                            <div className="mpc-img-wrap">
                              <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'} alt={p.title} />
                              {p.isVerified && <span className="mpc-verified">✓</span>}
                            </div>
                            <div className="mpc-info">
                              <div className="mpc-price">{formatPrice(p.price)}</div>
                              <div className="mpc-title">{p.title}</div>
                              <div className="mpc-loc"><FaMapMarkerAlt />{p.address?.locality || p.address?.city}</div>
                              <div className="mpc-specs">
                                {p.details?.bedrooms && <span>{p.details.bedrooms} Bed</span>}
                                {p.details?.area && <span>{p.details.area} sqft</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;