import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaArrowLeft, FaHeart, FaMapMarkerAlt, FaHome, FaRegBuilding,
    FaRegFileAlt, FaPhoneAlt, FaCheckCircle, FaPlayCircle, FaArrowRight, 
    FaPlus, FaTrash, FaCloudUploadAlt, FaWifi, FaDumbbell, FaBatteryFull, 
    FaArrowUp, FaCar, FaShieldAlt, FaUsers, FaSwimmer, FaVideo, FaGamepad
} from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import Select, { components } from 'react-select';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_PROPERTIES } from '../api/config';
import './PostProperty.css';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CITY_OPTIONS = [
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Gurgaon', label: 'Gurgaon' },
    { value: 'Noida', label: 'Noida' }
];

const LocationControl = ({ children, ...props }) => (
    <components.Control {...props}>
        <div style={{ paddingLeft: '8px', display: 'flex', alignItems: 'center', color: '#444' }}>
            <FaMapMarkerAlt />
        </div>
        {children}
    </components.Control>
);

const STEPS = [
    { id: 1, label: 'INTENT', icon: <FiUser /> },
    { id: 2, label: 'PROPERTY', icon: <FaRegFileAlt /> },
    { id: 3, label: 'LOCATION', icon: <FaMapMarkerAlt /> },
    { id: 4, label: 'PHOTOS', icon: <FaHome /> },
    { id: 5, label: 'PRICING', icon: <FaPhoneAlt /> },
    { id: 6, label: 'PUBLISH', icon: <FaCheckCircle /> },
];

const initialForm = {
    // Step 1
    intent: 'Sell my property',
    propertyType: 'Flat / Apartment',
    // Step 2
    aboutProperty: '',
    bedrooms: '3',
    bathrooms: '3',
    otherRooms: ['Study room'],
    furnished: 'Furnished',
    parking: 'None',
    preferredFor: 'Family',
    carpetArea: '1254 sqft',
    builtUpArea: '1054 sqft',
    floorNumber: '6 th',
    totalFloor: '12',
    propertyAge: '1254 sqft',
    facingDirection: '1054 sqft',
    amenities: ['Gym', 'Security', 'Swimming pool'],
    otherAmenities: '',
    // Step 3
    societyName: 'Luxury Riverfront Retreat With Terrace',
    flatNumber: '6 th',
    reraNo: '12',
    locality: 'Durgapur City Center',
    pincode: '1054 sqft',
    city: 'Durgapur',
    state: 'West Bengal',
    locality2: '1254 sqft',
    city2: '1054 sqft',
    lat: 22.5726,
    lng: 88.3639,
    nearbyPlaces: [
        { name: 'DAV School', dist: '4-5 km' },
        { name: 'Delhi Public school', dist: '5-6 km' },
        { name: 'Vedanta hospital', dist: '4-5 km' },
        { name: 'Myopia clinic', dist: '1-2 km' },
        { name: 'Delhi university', dist: '6-8 km' },
        { name: 'Indra gandhi collage', dist: '7-8 km' }
    ],
    // Step 4
    images: [], // { url, file, category }
    video: null, // { url, file }
    // Step 5
    expectedPrice: '6999.00',
    priceNegotiable: 'Yes open to offers',
    transactionType: 'New booking',
    availableFrom: 'Immidiate',
    ownershipType: 'Free hold',
    boostVisibility: 'FREE'
};

const PostProperty = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [headerCities, setHeaderCities] = useState([CITY_OPTIONS[0]]);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const progress = step === 1 ? 11 : step === 2 ? 24 : step === 3 ? 36 : step === 4 ? 50 : step === 5 ? 70 : 100;

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const toggle = (key, val) => {
        const list = form[key] || [];
        update(key, list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
    };

    const handleNearbyChange = (index, field, value) => {
        const updated = [...form.nearbyPlaces];
        updated[index][field] = value;
        update('nearbyPlaces', updated);
    };

    const addNearbyPlace = () => {
        update('nearbyPlaces', [...form.nearbyPlaces, { name: '', dist: '' }]);
    };

    const removeNearbyPlace = (index) => {
        const updated = form.nearbyPlaces.filter((_, i) => i !== index);
        update('nearbyPlaces', updated);
    };

    const handleFileChange = (e, category = 'others') => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            category: category || 'others'
        }));
        update('images', [...form.images, ...newImages]);
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            update('video', {
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const removeImage = (index) => {
        const updated = form.images.filter((_, i) => i !== index);
        update('images', updated);
    };

    const LocationMarker = () => {
        useMapEvents({
            async click(e) {
                const { lat, lng } = e.latlng;
                update('lat', lat);
                update('lng', lng);
                
                try {
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    if (res.data && res.data.address) {
                        const { address } = res.data;
                        const newCity = address.city || address.town || address.village || address.county || '';
                        const newState = address.state || '';
                        const newPincode = address.postcode || '';
                        const newLocality = address.suburb || address.neighbourhood || address.road || '';
                        
                        setForm(prev => ({
                            ...prev,
                            city: newCity,
                            state: newState,
                            pincode: newPincode,
                            locality: newLocality,
                            city2: newCity,
                            locality2: newLocality,
                            nearbyPlaces: [
                                { name: `${newLocality || newCity} Public School`, dist: '1-2 km' },
                                { name: `${newLocality || newCity} General Hospital`, dist: '2-3 km' },
                                { name: `${newLocality || newCity} Shopping Mall`, dist: '3-4 km' },
                                { name: `${newLocality || newCity} Metro Station`, dist: '1-2 km' }
                            ]
                        }));
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                }
            },
        });

        return form.lat && form.lng ? (
            <Marker position={[form.lat, form.lng]} />
        ) : null;
    };

    const next = () => {
        setError('');
        if (step < 6) setStep(s => s + 1);
    };

    const prev = () => {
        setError('');
        if (step > 1) setStep(s => s - 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            // Map propertyType to backend enum
            const typeMap = {
                'Flat / Apartment': 'apartment',
                'Independent house': 'independent_house',
                'Villa': 'villa',
                'Farm house': 'farm',
                'Luxury Bungalow': 'luxury_bungalow',
                'Paying Guest (PG)': 'pg',
                'Plot / Land': 'plot',
                'Commercial': 'commercial',
                'Project': 'project'
            };
            const mappedType = typeMap[form.propertyType] || form.propertyType.toLowerCase().replace(/ /g, '_');

            const furnishMap = {
                'Furnished': 'fully_furnished',
                'Semi furnished': 'semi_furnished',
                'Not furnished': 'unfurnished'
            };

            const token = localStorage.getItem('mp_token');
            const storedUser = JSON.parse(localStorage.getItem('mp_user') || '{}');
            const ownerId = storedUser.id || storedUser._id;

            // Upload helper
            const uploadFile = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await axios.post(`${API_PROPERTIES.replace('/api/properties', '')}/api/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return `${API_PROPERTIES.replace('/api/properties', '')}${res.data.url}`;
            };

            // Upload images
            const uploadedImages = [];
            for (const img of form.images) {
                if (img.file) {
                    const url = await uploadFile(img.file);
                    uploadedImages.push(url);
                }
            }

            // Upload video
            let videoUrl = null;
            if (form.video && form.video.file) {
                videoUrl = await uploadFile(form.video.file);
            }

            const payload = {
                owner: ownerId,
                title: form.societyName || `${form.bedrooms} BHK ${form.propertyType}`,
                description: form.aboutProperty || `Beautiful ${form.bedrooms} BHK ${form.propertyType} in ${form.city}.`,
                price: parseFloat(form.expectedPrice.replace(/,/g, '')) || 0,
                priceType: form.intent.includes('Rent') ? 'rent' : 'sale',
                propertyType: mappedType,
                address: {
                    street: form.societyName,
                    city: form.city,
                    locality: form.locality,
                    state: form.state,
                    pincode: form.pincode,
                    coordinates: { lat: form.lat, lng: form.lng }
                },
                details: {
                    bedrooms: parseInt(form.bedrooms) || 0,
                    bathrooms: parseInt(form.bathrooms) || 0,
                    carpetArea: parseInt(form.carpetArea) || 0,
                    builtUpArea: parseInt(form.builtUpArea) || 0,
                    furnished: furnishMap[form.furnished] || 'unfurnished',
                    parking: form.parking,
                    floor: form.floorNumber,
                    propertyAge: form.propertyAge,
                    facingDirection: form.facingDirection,
                    amenities: form.amenities,
                    reraNo: form.reraNo,
                    nearbyPlaces: form.nearbyPlaces
                },
                images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'],
                video: videoUrl
            };
            
            const config = {
                headers: {}
            };
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            await axios.post(API_PROPERTIES, payload, config);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to post property. Please check your details.');
            // Do not set submitted to true on error
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="pp-success-screen">
                <div className="pp-success-card">
                    <FaCheckCircle className="pp-success-icon" />
                    <h2>Property Listed!</h2>
                    <p>Your property is submitted successfully.</p>
                    <button className="btn-orange" onClick={() => navigate('/properties')}>View Listings</button>
                </div>
            </div>
        );
    }

    return (
        <div className="pp-layout">
            <div className="pp-header">
                <div className="pp-header-left">
                    <div className="header-item">
                        <FaMapMarkerAlt style={{ color: '#000' }} />
                        <span>Kolkata</span>
                    </div>
                    <div className="header-item">
                        <span>Help & Support</span>
                        <span style={{ fontSize: '10px' }}>▼</span>
                    </div>
                </div>

                <Link to="/" className="logo-center" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="logo-icon-box"><span className="logo-m">M</span></div>
                    <h1 className="logo-text-main" style={{ margin: 0 }}>MANYPROP</h1>
                </Link>

                <div className="pp-header-right">
                    <div className="user-icon-btn"><FiUser /></div>
                    <button className="post-prop-btn-main">
                        Post Property <span className="free-badge">FREE</span>
                    </button>
                </div>
            </div>

            <div className="pp-container">
                <div className="pp-progress-section">
                    <div className="pp-progress-top">
                        <button className="pp-exit" onClick={() => navigate(-1)}><FaArrowLeft /> Exit</button>
                        <div className="safe-secure-badge"><FaCheckCircle /> 100% Safe & Secure</div>
                    </div>

                    <div className="pp-progress-top mt-3">
                        <div className="pp-step-text">Step {step} of 6</div>
                        <span className="pct">{progress}% Complete</span>
                    </div>

                    {error && (
                        <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginTop: '10px', fontWeight: '500' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="pp-stepper">
                        <div className="stepper-line-bg"></div>
                        <div className="stepper-line" style={{ width: `${Math.max(0, (step - 1)) * 20}%` }}></div>
                        {STEPS.map((s, idx) => (
                            <div key={s.id} className={`step-item ${step >= s.id ? 'active' : ''}`} onClick={() => s.id < step && setStep(s.id)}>
                                <div className="step-circle">{s.icon}</div>
                                <div className="step-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pp-content-box">
                    {step === 1 && (
                        <div className="step-slide">
                            <h2 className="step-heading-main">I want to</h2>
                            <div className="intent-grid">
                                <div className={`intent-card ${form.intent === 'Sell my property' ? 'selected' : ''}`} onClick={() => update('intent', 'Sell my property')}>
                                    <div className="intent-title">Sell my property</div>
                                    <div className="intent-desc">List for outright sale — buyers contact you directly</div>
                                </div>
                                <div className={`intent-card ${form.intent === 'Rent out my property' ? 'selected' : ''}`} onClick={() => update('intent', 'Rent out my property')}>
                                    <div className="intent-title">Rent out my property</div>
                                    <div className="intent-desc">Find verified tenants, set your monthly rent</div>
                                </div>
                                <div className={`intent-card ${form.intent === 'Sell+ Rent' ? 'selected' : ''}`} onClick={() => update('intent', 'Sell+ Rent')}>
                                    <div className="intent-title">Sell+ Rent</div>
                                    <div className="intent-desc">Dual listing — more visibility, faster result</div>
                                </div>
                            </div>

                            <div className="section-divider"></div>

                            <h2 className="step-heading-main">Property Type</h2>
                            <div className="property-type-grid-new">
                                {[
                                    'Independent house', 'Flat / Apartment', 'Villa', 'Project',
                                    'Paying Guest (PG)', 'Plot / Land', 'Farm house', 'Luxury Bungalow'
                                ].map(t => (
                                    <div key={t} className={`prop-type-btn ${form.propertyType === t ? 'selected' : ''}`} onClick={() => update('propertyType', t)}>
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-slide">
                            <h2 className="step-heading-main">Tell us about our property</h2>
                            <textarea
                                className="about-property-textarea"
                                value={form.aboutProperty}
                                onChange={e => update('aboutProperty', e.target.value)}
                                placeholder="Describe your property — highlight key features, nearby landmarks, unique selling points..."
                                rows={5}
                            />

                            <div className="form-sections-vertical">
                                <div className="form-row-new">
                                    <label className="row-label">Configuration</label>
                                    <div className="chip-group-new">
                                        {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+'].map(t => (
                                            <div key={t} className={`chip-new ${form.bedrooms === t ? 'selected' : ''}`} onClick={() => update('bedrooms', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <label className="row-label">Bathroom:</label>
                                    <div className="chip-group-new">
                                        {['1', '2', '3', '4', '5+'].map(t => (
                                            <div key={t} className={`chip-new circle ${form.bathrooms === t ? 'selected' : ''}`} onClick={() => update('bathrooms', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <label className="row-label">Other room:</label>
                                    <div className="chip-group-new">
                                        {['Study room', 'Guest Room', 'Puja room', 'Store room'].map(t => (
                                            <div key={t} className={`chip-new ${form.otherRooms.includes(t) ? 'selected' : ''}`} onClick={() => toggle('otherRooms', t)}>{t}</div>
                                        ))}
                                        <input type="text" className="chip-input-small" placeholder="Type" />
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <label className="row-label">Furnishing Status:</label>
                                    <div className="chip-group-new">
                                        {['Furnished', 'Not furnished', 'Semi furnished'].map(t => (
                                            <div key={t} className={`chip-new ${form.furnished === t ? 'selected' : ''}`} onClick={() => update('furnished', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <label className="row-label">Parking:</label>
                                    <div className="chip-group-new">
                                        {['None', 'Covered', 'Open parking'].map(t => (
                                            <div key={t} className={`chip-new ${form.parking === t ? 'selected' : ''}`} onClick={() => update('parking', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <label className="row-label">Prefered for</label>
                                    <div className="chip-group-new">
                                        {['Family', 'Bachelors', 'Professionals', 'Other'].map(t => (
                                            <div key={t} className={`chip-new ${form.preferredFor === t ? 'selected' : ''}`} onClick={() => update('preferredFor', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="section-divider"></div>

                            <div className="input-grid-2col">
                                <div className="input-item-new"><label>Carpet area:</label><input type="text" value={form.carpetArea} placeholder="1254 sqft" onChange={e => update('carpetArea', e.target.value)} /></div>
                                <div className="input-item-new"><label>Buildup Area</label><input type="text" value={form.builtUpArea} placeholder="1054 sqft" onChange={e => update('builtUpArea', e.target.value)} /></div>
                                <div className="input-item-new"><label>Floor number</label><input type="text" value={form.floorNumber} placeholder="6 th" onChange={e => update('floorNumber', e.target.value)} /></div>
                                <div className="input-item-new"><label>Total floor</label><input type="text" value={form.totalFloor} placeholder="12" onChange={e => update('totalFloor', e.target.value)} /></div>
                                <div className="input-item-new"><label>Property age</label><input type="text" value={form.propertyAge} placeholder="1254 sqft" onChange={e => update('propertyAge', e.target.value)} /></div>
                                <div className="input-item-new"><label>Facing direction</label><input type="text" value={form.facingDirection} placeholder="1054 sqft" onChange={e => update('facingDirection', e.target.value)} /></div>
                            </div>

                            <div className="section-divider"></div>

                            <h2 className="step-heading-main">Popular Amenities</h2>
                            <div className="amenities-grid-new">
                                {[
                                    { label: 'WIFI', icon: <FaWifi /> }, 
                                    { label: 'Gym', icon: <FaDumbbell /> }, 
                                    { label: 'Power backup', icon: <FaBatteryFull /> }, 
                                    { label: 'Lift', icon: <FaArrowUp /> },
                                    { label: 'Covered Parking', icon: <FaCar /> }, 
                                    { label: 'Security', icon: <FaShieldAlt /> }, 
                                    { label: 'Club house', icon: <FaUsers /> }, 
                                    { label: 'Swimming pool', icon: <FaSwimmer /> },
                                    { label: 'CCTV Camera', icon: <FaVideo /> }, 
                                    { label: 'Play area', icon: <FaGamepad /> }
                                ].map((item, idx) => (
                                    <div key={idx} className={`amenity-card-new ${form.amenities.includes(item.label) ? 'selected' : ''}`} onClick={() => toggle('amenities', item.label)}>
                                        <div className="amenity-check-box"></div>
                                        <div className="amenity-icon-box" style={{ marginRight: '8px', color: form.amenities.includes(item.label) ? '#ea580c' : '#888', display: 'flex', alignItems: 'center' }}>
                                            {item.icon}
                                        </div>
                                        <div className="amenity-label-new">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '8px', display: 'block' }}>Others:</label>
                                <input type="text" className="chip-input-small" style={{ width: '100%', maxWidth: '300px' }} placeholder="" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-slide">
                            <h2 className="step-heading-main">Where is the property?</h2>
                            <p className="step-desc-text-small">Exact location helps buyers find you and builds trust with verified address.</p>

                            <div className="map-container-wrap">
                                <MapContainer center={[form.lat, form.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                            </div>

                            <div className="input-grid-2col mt-4">
                                <div className="input-item-new full-width"><label>Society name/ Project name</label><input type="text" value={form.societyName} onChange={e => update('societyName', e.target.value)} /></div>
                                <div className="input-item-new"><label>Flat number</label><input type="text" value={form.flatNumber} onChange={e => update('flatNumber', e.target.value)} /></div>
                                <div className="input-item-new"><label>RERA No</label><input type="text" value={form.reraNo} onChange={e => update('reraNo', e.target.value)} /></div>
                                <div className="input-item-new"><label>Locality</label><input type="text" value={form.locality} onChange={e => update('locality', e.target.value)} /></div>
                                <div className="input-item-new"><label>Pin code</label><input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value)} /></div>
                                <div className="input-item-new"><label>City</label><input type="text" value={form.city} onChange={e => update('city', e.target.value)} /></div>
                                <div className="input-item-new"><label>State</label><input type="text" value={form.state} onChange={e => update('state', e.target.value)} /></div>
                                <div className="input-item-new"><label>Locality</label><input type="text" value={form.locality2} onChange={e => update('locality2', e.target.value)} /></div>
                                <div className="input-item-new"><label>City</label><input type="text" value={form.city2} onChange={e => update('city2', e.target.value)} /></div>
                            </div>

                            <div className="privacy-protected-msg-new">
                                <div className="msg-title">Privacy Protected</div>
                                <div className="msg-desc">Your exact address will only be shared with serious buyers after verification.</div>
                            </div>

                            <h2 className="step-heading-main mt-5">Places nearby</h2>
                            <p className="step-desc-text-small">Useful place near your property (Edit or add your own)</p>
                            <div className="places-grid-2col-interactive">
                                {form.nearbyPlaces.map((p, idx) => (
                                    <div key={idx} className="place-item-card-interactive">
                                        <input type="text" className="p-name-input" value={p.name} onChange={(e) => handleNearbyChange(idx, 'name', e.target.value)} placeholder="Place" />
                                        <input type="text" className="p-dist-input" value={p.dist} onChange={(e) => handleNearbyChange(idx, 'dist', e.target.value)} placeholder="Dist" />
                                        <button className="remove-place-btn" onClick={() => removeNearbyPlace(idx)}><FaTrash /></button>
                                    </div>
                                ))}
                            </div>
                            <button className="add-place-btn-new" onClick={addNearbyPlace}><FaPlus /> Add more places</button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="step-slide">
                            <div className="media-split-layout">
                                <div className="media-main-preview">
                                    <h3 className="media-label-header">Front image</h3>
                                    <div className="main-img-box upload-trigger" onClick={() => fileInputRef.current.click()}>
                                        {form.images.length > 0 ? (
                                            <img src={form.images[form.images.length - 1].url} alt="Latest" />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <FaCloudUploadAlt />
                                                <span>Click to upload images</span>
                                            </div>
                                        )}
                                        <input type="file" multiple hidden ref={fileInputRef} accept="image/*" onChange={(e) => handleFileChange(e)} />
                                    </div>
                                </div>
                                <div className="media-main-preview">
                                    <h3 className="media-label-header">Video Tour</h3>
                                    <div className="main-img-box video-box upload-trigger" onClick={() => videoInputRef.current.click()}>
                                        {form.video ? (
                                            <>
                                                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" alt="Video Placeholder" />
                                                <div className="play-btn-large"><div className="play-triangle"></div></div>
                                            </>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <FaCloudUploadAlt />
                                                <span>Click to upload video</span>
                                            </div>
                                        )}
                                        <input type="file" hidden ref={videoInputRef} accept="video/*" onChange={handleVideoChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="media-thumbnails-grid-new">
                                <div className="thumb-col" onClick={() => fileInputRef.current.click()}>
                                    <div className="thumb-box-v2 add-media-placeholder"><span className="plus-sign">+</span></div>
                                    <span className="thumb-name-label">Bedroom</span>
                                </div>
                                {form.images.map((img, idx) => (
                                    <div key={idx} className="thumb-col">
                                        <div className="thumb-box-v2">
                                            <img src={img.url} alt={`Preview ${idx}`} />
                                            <button className="remove-media-tiny" onClick={() => removeImage(idx)}>×</button>
                                        </div>
                                        <span className="thumb-name-label">{img.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="step-slide step-5-pricing">
                            <h2 className="step-heading-main">Set your price</h2>
                            <p className="step-desc-text-small">We'll show how your price compares to similar properties in the locality.</p>

                            <div className="form-sections-vertical pricing-form-new">
                                <div className="form-row-new">
                                    <label className="row-label">Expected price</label>
                                    <div className="price-box-wrap">
                                        <span>₹</span>
                                        <input type="text" value={form.expectedPrice} placeholder="10,00,000" onChange={e => update('expectedPrice', e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-row-new">
                                    <label className="row-label">Is price negotiable?</label>
                                    <div className="chip-group-new">
                                        {['Yes open to offers', 'Slightly negotiable', 'Firm Price'].map(t => (
                                            <div key={t} className={`chip-new ${form.priceNegotiable === t ? 'selected' : ''}`} onClick={() => update('priceNegotiable', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-row-new">
                                    <label className="row-label">Transaction type</label>
                                    <div className="chip-group-new">
                                        {['Resale', 'New booking'].map(t => (
                                            <div key={t} className={`chip-new ${form.transactionType === t ? 'selected' : ''}`} onClick={() => update('transactionType', t)}>{t}</div>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-row-new">
                                    <label className="row-label">Available from</label>
                                    <div className="input-item-new" style={{ flex: 1 }}>
                                        <input type="text" value={form.availableFrom} placeholder="Immidiate" style={{ width: '250px' }} onChange={e => update('availableFrom', e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-row-new">
                                    <label className="row-label">Ownership type</label>
                                    <div className="input-item-new" style={{ flex: 1 }}>
                                        <input type="text" value={form.ownershipType} placeholder="Free hold" style={{ width: '250px' }} onChange={e => update('ownershipType', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="boost-visibility-section">
                                <h3 className="boost-title">Boost visibility (optional)</h3>
                                <div className="visibility-grid">
                                    <div className={`visibility-card ${form.boostVisibility === 'FREE' ? 'selected' : ''}`} onClick={() => update('boostVisibility', 'FREE')}>
                                        <div className="vis-label">FREE</div>
                                        <div className="vis-sub">Standard listing</div>
                                        <div className="vis-price">₹0</div>
                                    </div>
                                    <div className={`visibility-card ${form.boostVisibility === 'Featured' ? 'selected' : ''}`} onClick={() => update('boostVisibility', 'Featured')}>
                                        <div className="vis-label">Featured</div>
                                        <div className="vis-sub">Top of search · 30d</div>
                                        <div className="vis-price">₹499</div>
                                    </div>
                                    <div className={`visibility-card ${form.boostVisibility === 'Premium' ? 'selected' : ''}`} onClick={() => update('boostVisibility', 'Premium')}>
                                        <div className="vis-label">Premium</div>
                                        <div className="vis-sub">Banner + alerts · 30d</div>
                                        <div className="vis-price">₹999</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {step === 6 && (
                        <div className="step-slide publish-preview-step">
                            <h2 className="step-heading-main">Preview — You're almost live!</h2>
                            <p className="step-desc-text-small">Review your listing quality score and publish when ready.</p>

                            <div className="preview-content-grid">
                                <div className="property-preview-card">
                                    <div className="preview-card-img">
                                        <img src={form.images.length > 0 ? form.images[0].url : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"} alt="Property" />
                                    </div>
                                    <div className="preview-card-info">
                                        <div className="price-row-preview">
                                            <span className="price-val">₹{form.expectedPrice}</span>
                                            <span className="price-type">/month</span>
                                        </div>
                                        <h3 className="preview-card-title">{form.societyName || 'Your Property'}</h3>
                                        <p className="preview-card-loc">{form.locality}</p>
                                        <div className="preview-specs-strip">
                                            <span>{form.bedrooms} Bed</span>
                                            <span>{form.bathrooms} Bath</span>
                                            <span>{form.carpetArea}</span>
                                        </div>
                                        <div className="preview-action-circ"><FaArrowRight /></div>
                                    </div>
                                </div>

                                <div className="publish-actions-panel">
                                    <button className="btn-publish-now" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? 'Publishing...' : 'Publish Now'}
                                    </button>
                                    <div className="secondary-publish-btns">
                                        <button className="btn-outline-grey" onClick={prev}>Go back</button>
                                        <button className="btn-outline-grey" onClick={() => navigate('/properties')}>Save as draft</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {step < 6 && (
                        <div className="pp-nav-buttons-new">
                            {step > 1 ? <button className="btn-back-new" onClick={prev}>← Back</button> : <div></div>}
                            <button className="btn-next-new" onClick={next}>
                                {step === 1 ? 'Next to Property →' :
                                    step === 2 ? 'Next to Location →' :
                                        step === 3 ? 'Next to Photos →' :
                                            step === 4 ? 'Next to Pricing →' :
                                                'Next to Publish →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostProperty;
