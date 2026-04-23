import React, { useState } from 'react';
import { FaToggleOn, FaToggleOff, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './FilterSidebar.css';

const PROPERTY_TYPES = ['Flat', 'Apartment', 'Villa', 'Farm', 'Plot', 'Commercial', 'PG', 'Bungalow', 'Project'];
const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'];
const AMENITIES_LIST = ['GYM', 'Parking', 'Swimming Pool', 'Guard', 'CCTV'];
const CONSTRUCTION = ['Under Construction', 'Ready To Move', 'New Launch'];
const FURNISHING = ['Unfurnished', 'Semi Furnished', 'Furnished'];
const POSTED_BY = ['Owner', 'Broker', 'Developer'];
const PROPERTY_AGE = ['1 Year', '2 Year', '3 Year', '4 Year', '5 Year', '10 Year', '20 Year'];
const SORT_NEARBY = ['School', 'Hospital', 'Metro', 'Mall', 'Park', 'Office'];

const sliderToPrice = (v) => v * 100000;
const priceToSlider = (p) => Math.round(p / 100000);
const formatPrice = (p) => p >= 10000000 ? `₹${(p / 10000000).toFixed(1)} Cr` : `₹${(p / 100000).toFixed(0)} L`;

const FilterSidebar = ({ filters = {}, onFilterChange, onClearAll, priceType, onPriceTypeChange }) => {
    const navigate = useNavigate();
    const [openSections, setOpenSections] = useState({
        budget: true,
        type: true,
        bhk: true,
        aminities: true,
        postedBy: true,
        furnishing: true,
        amenities: true,
        construction: true,
        propertyAge: true,
        sortNearby: false,
    });

    const sliderVal = priceToSlider(filters.maxPrice ?? 10000000);

    const emit = (key, val) => {
        if (onFilterChange) onFilterChange({ [key]: val });
    };

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAmenity = (amenity) => {
        const current = filters.amenities || [];
        const next = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        emit('amenities', next);
    };

    const SectionHeader = ({ label, sectionKey, count, usePlus }) => (
        <div className="section-header" onClick={() => toggleSection(sectionKey)}>
            <label>
                {label} {usePlus && <span style={{ marginLeft: '4px', fontSize: '1.1rem', fontWeight: '500' }}>{openSections[sectionKey] ? '−' : '+'}</span>}
                {count > 0 && <span className="section-count">{count}</span>}
            </label>
        </div>
    );

    return (
        <div className="filter-sidebar design-sidebar">
            {/* ── Header ─────────────────────────── */}
            <div className="filter-header design-filter-header">
                <h3 className="filter-title">Smart Filter</h3>
                <button className="clear-all design-clear-all" onClick={onClearAll}>Clear all</button>
            </div>

            {/* ── Verified Listing Toggle ─────────────────── */}
            <div className="filter-section design-section-no-divider">
                <div className="filter-row design-verified-row">
                    <label>Verified Listing</label>
                    <div className="design-toggle-btn" onClick={() => emit('isVerified', !filters.isVerified)}>
                        {filters.isVerified
                            ? <FaToggleOn className="toggle-icon active" style={{ fontSize: '1.5rem', color: '#000' }} />
                            : <FaToggleOff className="toggle-icon" style={{ fontSize: '1.5rem', color: '#ccc' }} />}
                    </div>
                </div>
            </div>

            {/* ── Budget Slider ────────────────────── */}
            <div className="filter-section divider">
                <SectionHeader label="Budget" sectionKey="budget" count={filters.maxPrice < 10000000 ? 1 : 0} />
                {openSections.budget && (
                    <>
                        <div className="range-header" style={{ marginTop: 10 }}>
                            <span className="range-label">Max Price</span>
                            <span className="range-value">{formatPrice(filters.maxPrice ?? 10000000)}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            step="5"
                            value={sliderVal}
                            onChange={(e) => emit('maxPrice', sliderToPrice(Number(e.target.value)))}
                            className="budget-slider"
                        />
                        <div className="range-labels">
                            <span>₹10L</span>
                            <span>₹2Cr+</span>
                        </div>
                        <div className="budget-presets">
                            {[
                                { label: '< 50L', val: 5000000 },
                                { label: '50–80L', val: 8000000 },
                                { label: '1Cr+', val: 50000000 },
                            ].map(p => (
                                <button
                                    key={p.label}
                                    className={`budget-preset ${(filters.maxPrice ?? 10000000) === p.val ? 'active' : ''}`}
                                    onClick={() => emit('maxPrice', p.val)}
                                >{p.label}</button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Sort Nearby ────────────────────── */}
            <div className="filter-section divider">
                <div className="sort-nearby-row">
                    <span className="sort-nearby-label">Sort Nearby</span>
                    <select
                        className="sort-nearby-select"
                        value={filters.sortNearby || ''}
                        onChange={e => emit('sortNearby', e.target.value || null)}
                    >
                        <option value="">Select</option>
                        {SORT_NEARBY.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            {/* ── RERA Verified ─────────────────── */}
            <div className="filter-section divider">
                <div className="rera-row">
                    <span className="rera-label">RERA Verified</span>
                    <div className="rera-chips">
                        {['Properties', 'Dealers'].map(opt => (
                            <button
                                key={opt}
                                className={`rera-chip ${filters.reraType === opt ? 'active' : ''}`}
                                onClick={() => emit('reraType', filters.reraType === opt ? null : opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Property Type ────────────────────── */}
            <div className="filter-section design-section-no-divider">
                <SectionHeader label="Property Type" sectionKey="type" count={filters.propertyType ? 1 : 0} usePlus />
                {openSections.type && (
                    <div className="tag-cloud">
                        {PROPERTY_TYPES.map((type) => (
                            <button
                                key={type}
                                className={`filter-tag ${filters.propertyType === type ? 'active' : ''}`}
                                onClick={() => emit('propertyType', filters.propertyType === type ? null : type)}
                            >{type} {filters.propertyType !== type && '+'}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── BHK Type ─────────────────────────── */}
            <div className="filter-section design-section-no-divider">
                <SectionHeader label="BHK Type" sectionKey="bhk" count={filters.bhkType ? 1 : 0} usePlus />
                {openSections.bhk && (
                    <div className="tag-cloud">
                        {BHK_TYPES.map((bhk) => (
                            <button
                                key={bhk}
                                className={`filter-tag ${filters.bhkType === bhk ? 'active' : ''}`}
                                onClick={() => emit('bhkType', filters.bhkType === bhk ? null : bhk)}
                            >{bhk} {filters.bhkType !== bhk && '+'}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Aminities (BHK-style selector) ── */}
            <div className="filter-section design-section-no-divider">
                <SectionHeader label="Aminities" sectionKey="aminities" count={(filters.bhkAminities || []).length} usePlus />
                {openSections.aminities && (
                    <div className="tag-cloud">
                        {BHK_TYPES.map((bhk) => (
                            <button
                                key={bhk}
                                className={`filter-tag ${(filters.bhkAminities || []).includes(bhk) ? 'active' : ''}`}
                                onClick={() => {
                                    const curr = filters.bhkAminities || [];
                                    const next = curr.includes(bhk) ? curr.filter(b => b !== bhk) : [...curr, bhk];
                                    emit('bhkAminities', next);
                                }}
                            >{bhk} {!(filters.bhkAminities || []).includes(bhk) && '+'}</button>
                        ))}
                        <button
                            className={`filter-tag ${filters.bhkAmMore ? 'active' : ''}`}
                            onClick={() => emit('bhkAmMore', !filters.bhkAmMore)}
                        >More {!filters.bhkAmMore && '+'}</button>
                    </div>
                )}
            </div>

            {/* ── Posted By ────────────────────────── */}
            <div className="filter-section divider">
                <SectionHeader label="Posted by" sectionKey="postedBy" count={filters.postedBy ? 1 : 0} />
                {openSections.postedBy && (
                    <div className="tag-cloud">
                        {POSTED_BY.map(pb => (
                            <button
                                key={pb}
                                className={`filter-tag ${filters.postedBy === pb ? 'active' : ''}`}
                                onClick={() => emit('postedBy', filters.postedBy === pb ? null : pb)}
                            >{pb}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Furnishing Status ───────────────── */}
            <div className="filter-section divider">
                <SectionHeader label="Furnishing status" sectionKey="furnishing" count={filters.furnished ? 1 : 0} />
                {openSections.furnishing && (
                    <div className="tag-cloud">
                        {FURNISHING.map((f) => (
                            <button
                                key={f}
                                className={`filter-tag ${filters.furnished === f ? 'active' : ''}`}
                                onClick={() => emit('furnished', filters.furnished === f ? null : f)}
                            >{f}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Amenities (checkbox style) ───────── */}
            <div className="filter-section divider">
                <SectionHeader label="Amenities" sectionKey="amenities" count={(filters.amenities || []).length} />
                {openSections.amenities && (
                    <div className="tag-cloud">
                        {AMENITIES_LIST.map((a) => (
                            <button
                                key={a}
                                className={`filter-tag ${(filters.amenities || []).includes(a) ? 'active' : ''}`}
                                onClick={() => toggleAmenity(a)}
                            >{a} {!(filters.amenities || []).includes(a) && '+'}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Construction Status ──────────────── */}
            <div className="filter-section divider">
                <SectionHeader label="Construction Status" sectionKey="construction" count={filters.constructionStatus ? 1 : 0} />
                {openSections.construction && (
                    <div className="tag-cloud">
                        {CONSTRUCTION.map(s => (
                            <button
                                key={s}
                                className={`filter-tag ${filters.constructionStatus === s ? 'active' : ''}`}
                                onClick={() => emit('constructionStatus', filters.constructionStatus === s ? null : s)}
                            >{s}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Property Age ────────────────────── */}
            <div className="filter-section divider">
                <SectionHeader label="Property age" sectionKey="propertyAge" count={filters.propertyAge ? 1 : 0} />
                {openSections.propertyAge && (
                    <div className="tag-cloud">
                        {PROPERTY_AGE.map(age => (
                            <button
                                key={age}
                                className={`filter-tag ${filters.propertyAge === age ? 'active' : ''}`}
                                onClick={() => emit('propertyAge', filters.propertyAge === age ? null : age)}
                            >{age}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Post Your Property card ─────────── */}
            <div className="post-property-card" onClick={() => navigate('/post-property')} style={{ cursor: 'pointer', position: 'relative' }}>
                <div className="post-content">
                    <FaHome style={{ fontSize: '1.6rem', color: '#fff', marginBottom: 8 }} />
                    <h4>Post Your Property</h4>
                    <span className="free-badge" style={{ position: 'static', transform: 'none', padding: '2px 10px' }}>FREE</span>
                    <p>Advertise Faster</p>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
