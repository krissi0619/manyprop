const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
require('dotenv').config({ path: './.env' });

const statesData = [
    { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur'] },
    { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Tawang'] },
    { state: 'Assam', cities: ['Guwahati', 'Dibrugarh'] },
    { state: 'Bihar', cities: ['Patna', 'Gaya'] },
    { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai'] },
    { state: 'Goa', cities: ['Panaji', 'Margao', 'North Goa'] },
    { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
    { state: 'Haryana', cities: ['Gurgaon', 'Faridabad', 'Panipat'] },
    { state: 'Himachal Pradesh', cities: ['Shimla', 'Manali', 'Dharamshala'] },
    { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur'] },
    { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore'] },
    { state: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'] },
    { state: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Gwalior'] },
    { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane'] },
    { state: 'Manipur', cities: ['Imphal'] },
    { state: 'Meghalaya', cities: ['Shillong'] },
    { state: 'Mizoram', cities: ['Aizawl'] },
    { state: 'Nagaland', cities: ['Kohima', 'Dimapur'] },
    { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack'] },
    { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Chandigarh'] },
    { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur'] },
    { state: 'Sikkim', cities: ['Gangtok'] },
    { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
    { state: 'Telangana', cities: ['Hyderabad', 'Warangal'] },
    { state: 'Tripura', cities: ['Agartala'] },
    { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Varanasi'] },
    { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar'] },
    { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Darjeeling'] },
    { state: 'Delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi'] },
    { state: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu'] },
    { state: 'Ladakh', cities: ['Leh'] },
    { state: 'Puducherry', cities: ['Puducherry'] },
    { state: 'Chandigarh', cities: ['Chandigarh'] },
    { state: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
    { state: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Daman', 'Silvassa'] },
    { state: 'Lakshadweep', cities: ['Kavaratti'] }
];

const propertyTypes = ['flat', 'apartment', 'villa', 'farm', 'independent_house', 'luxury_bungalow', 'pg', 'plot', 'commercial', 'project'];
const priceTypes = ['sale', 'rent'];
const constructionStatuses = ['Under Construction', 'Ready To Move', 'New Launch'];
const postedByOptions = ['Owner', 'Dealer', 'Builder'];

const validImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1e52db06ac?auto=format&fit=crop&w=1000&q=80'
];

const generateProperties = () => {
    const props = [];
    statesData.forEach((stateObj, index) => {
        stateObj.cities.forEach((city, cityIndex) => {
            const pType = propertyTypes[(index + cityIndex) % propertyTypes.length];
            // PG properties are always rent
            let priceType;
            if (pType === 'pg') {
                priceType = 'rent';
            } else if (pType === 'plot' || pType === 'project') {
                priceType = 'sale';
            } else {
                priceType = priceTypes[cityIndex % 2];
            }

            // Set realistic prices based on property type
            let price;
            if (pType === 'pg') {
                price = 5000 + (index * 500) + (cityIndex * 200);
            } else if (pType === 'plot') {
                price = 1500000 + (index * 300000) + (cityIndex * 100000);
            } else if (pType === 'commercial') {
                price = priceType === 'sale' ? (5000000 + (index * 1000000)) : (25000 + (index * 3000));
            } else if (pType === 'project') {
                price = 3000000 + (index * 800000) + (cityIndex * 200000);
            } else {
                price = priceType === 'sale' ? (2000000 + (index * 500000) + (cityIndex * 100000)) : (15000 + (index * 2000) + (cityIndex * 500));
            }
            const area = pType === 'pg' ? (150 + (index * 10)) : (800 + (index * 50) + (cityIndex * 20));

            props.push({
                title: `${pType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} in ${city}`,
                description: `Beautiful ${pType} located in the heart of ${city}, ${stateObj.state}. Modern amenities and great connectivity.`,
                price: price,
                priceType: priceType,
                propertyType: pType,
                constructionStatus: constructionStatuses[(index + cityIndex) % constructionStatuses.length],
                postedBy: postedByOptions[(index + cityIndex) % postedByOptions.length],
                isVerified: (index + cityIndex) % 3 !== 0,
                bhkTypes: [`${(index % 3) + 2} BHK`],
                address: {
                    locality: `${city} Central`,
                    city: city,
                    state: stateObj.state,
                    pincode: `${(index + 10).toString().padStart(2, '0')}00${(cityIndex + 1).toString().padStart(2, '0')}`
                },
                details: {
                    bedrooms: (index % 3) + 2,
                    bathrooms: (index % 2) + 1,
                    area: area,
                    areaUnit: 'sqft',
                    furnished: (index + cityIndex) % 2 === 0 ? 'semi_furnished' : 'fully_furnished'
                },
                amenities: ['Gym', 'Parking', 'Security', 'Wi-Fi'],
                images: [validImages[(index + cityIndex) % validImages.length]],
                agentContact: {
                    name: `Contact Agent ${index}`,
                    phone: `+91 987${(index + 10).toString().padStart(2, '0')}43210`
                },
                featured: index % 5 === 0,
                trending: index % 7 === 0,
                recommended: index % 3 === 0
            });
        });
    });
    return props;
};

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manyprop';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB for seeding...');

        // Delete existing
        await Property.deleteMany({});
        await User.deleteMany({ email: 'admin@manyprop.com' });

        // Create a default user
        const user = new User({
            name: 'Admin',
            email: 'admin@manyprop.com',
            password: 'password123',
            role: 'admin'
        });
        await user.save();
        console.log('Default user created');

        // Add properties
        const properties = generateProperties();
        const propertiesWithUser = properties.map(p => ({ ...p, owner: user._id }));
        
        // Chunk insertion if needed, but here it's about 80-100 props, so it's fine
        await Property.insertMany(propertiesWithUser);
        console.log(`Seeded ${properties.length} properties across all states.`);

        mongoose.connection.close();
        console.log('Seeding complete');
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
