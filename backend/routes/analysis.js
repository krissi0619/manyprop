const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─────────────────────────────────────────────────────────────
// Helper: compute price/sqft
// ─────────────────────────────────────────────────────────────
const pricePerSqft = (price, area) =>
    area && area > 0 ? Math.round(price / area) : null;

// ─────────────────────────────────────────────────────────────
// Helper: compute days on market
// ─────────────────────────────────────────────────────────────
const daysOnMarket = (createdAt) =>
    Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));

// ─────────────────────────────────────────────────────────────
// Helper: listing quality score
// ─────────────────────────────────────────────────────────────
const computeQuality = (property) => {
    let score = 55;
    const improvements = [];
    const imagesCount = property.images ? property.images.length : 0;
    if (imagesCount >= 5) { score += 15; improvements.push({ text: 'Excellent photo coverage', ok: true }); }
    else if (imagesCount >= 3) { score += 8; improvements.push({ text: `Add ${5 - imagesCount} more photos`, ok: false }); }
    else { improvements.push({ text: `Add at least ${5 - imagesCount} more photos`, ok: false }); }

    const descLen = property.description ? property.description.length : 0;
    if (descLen > 200) { score += 12; improvements.push({ text: 'Detailed description provided', ok: true }); }
    else { improvements.push({ text: 'Expand property description (200+ chars)', ok: false }); }

    if (property.isVerified) { score += 8; improvements.push({ text: 'RERA / verified badge active', ok: true }); }
    else { improvements.push({ text: 'Highlight RERA number prominently', ok: false }); }

    const aminCount = property.amenities ? property.amenities.length : 0;
    if (aminCount >= 4) { score += 10; improvements.push({ text: 'Rich amenities listed', ok: true }); }
    else { improvements.push({ text: 'Add more amenities (gym, parking, etc.)', ok: false }); }

    return { score: Math.min(score, 100), improvements };
};

// ─────────────────────────────────────────────────────────────
// GET /api/analysis/property/:id
// Full AI analysis for a single owner property
// ─────────────────────────────────────────────────────────────
router.get('/property/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name phone');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // ── 1. Find comparable listings ───────────────────────────────
        const bedrooms = property.details?.bedrooms;
        const city = property.address?.city;
        const locality = property.address?.locality;
        const propType = property.propertyType;

        const comparableFilter = {
            _id: { $ne: property._id },
            propertyType: propType,
            'address.city': city ? new RegExp(city, 'i') : undefined,
            price: {
                $gte: property.price * 0.5,
                $lte: property.price * 1.6
            }
        };

        if (bedrooms) comparableFilter['details.bedrooms'] = { $gte: bedrooms - 1, $lte: bedrooms + 1 };
        // Remove undefined keys
        Object.keys(comparableFilter).forEach(k => comparableFilter[k] === undefined && delete comparableFilter[k]);

        const comparables = await Property.find(comparableFilter)
            .sort({ createdAt: -1 })
            .limit(8)
            .select('title price details address images createdAt status constructionStatus isVerified amenities');

        // ── 2. Compute market statistics ─────────────────────────────
        // If property has no price, use a regional default to avoid division errors
        const effectivePrice = property.price && property.price > 0 ? property.price : 5000000;

        const prices = comparables.map(c => c.price).filter(p => p && p > 0);
        prices.push(effectivePrice);

        const marketAvgPrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
        const marketMinPrice = Math.round(Math.min(...prices) * 0.95);
        const marketMaxPrice = Math.round(Math.max(...prices) * 1.05);

        const area = property.details?.area || property.details?.builtUpArea || null;
        const myPricePerSqft = pricePerSqft(property.price, area);
        const marketAvgPricePerSqft = area
            ? Math.round(marketAvgPrice / area)
            : null;

        const days = daysOnMarket(property.createdAt);

        // ── 3. Fetch enquiries for this property ─────────────────────
        const enquiryCount = await Enquiry.countDocuments({ property: property._id });

        // Enquiry rate benchmark: compare with market — rough heuristic
        const enquiryBenchmark = Math.max(1, Math.round(comparables.length > 0 ? comparables.length * 1.5 : 5));

        // ── 4. Quality score ─────────────────────────────────────────
        const { score: qualityScore, improvements: qualityImprovements } = computeQuality(property);

        // ── 5. Price scenarios ───────────────────────────────────────
        const fastSalePrice = Math.max(100000, Math.round(marketAvgPrice * 0.97 / 100000) * 100000);
        const recommendedPrice = Math.max(100000, Math.round((effectivePrice + marketAvgPrice) / 2 / 100000) * 100000);
        const holdPrice = effectivePrice;

        const formatPrice = (p) => {
            if (!p || isNaN(p)) return '₹—';
            return p >= 10000000 ? `₹${(p / 10000000).toFixed(2)}Cr` : `₹${(p / 100000).toFixed(0)}L`;
        };
        const formatPricePerSqft = (p, a) => a ? `₹${Math.round(p / a).toLocaleString()}` : '—';

        const scenarios = [
            {
                label: 'Fast sale',
                tag: 'fast',
                price: fastSalePrice,
                priceFormatted: formatPrice(fastSalePrice),
                pricePerSqftFormatted: formatPricePerSqft(fastSalePrice, area),
                days: '15–20 days',
                inquiryBoost: '+65% more inquiries',
                vsCurrentFormatted: `₹${Math.round(Math.abs(effectivePrice - fastSalePrice) / 100000)}L below current`,
                recommended: false
            },
            {
                label: 'Recommended',
                tag: 'recommended',
                price: recommendedPrice,
                priceFormatted: formatPrice(recommendedPrice),
                pricePerSqftFormatted: formatPricePerSqft(recommendedPrice, area),
                days: '25–35 days',
                inquiryBoost: '+40% more inquiries',
                vsCurrentFormatted: `₹${Math.round(Math.abs(effectivePrice - recommendedPrice) / 100000)}L ${effectivePrice > recommendedPrice ? 'below' : 'above'} current`,
                recommended: true
            },
            {
                label: 'Hold price',
                tag: 'hold',
                price: holdPrice,
                priceFormatted: formatPrice(holdPrice),
                pricePerSqftFormatted: formatPricePerSqft(holdPrice, area),
                days: '60–90 days',
                inquiryBoost: 'Current inquiry pace',
                vsCurrentFormatted: 'No change',
                recommended: false
            }
        ];

        // ── 6. Comparable listings formatted ────────────────────────
        const comparableListings = comparables.slice(0, 6).map(c => {
            const cDays = daysOnMarket(c.createdAt);
            const cPricePerSqft = pricePerSqft(c.price, c.details?.area);
            let statusLabel = 'Active';
            if (c.status === 'sold') statusLabel = `Sold in ${cDays}d`;
            else statusLabel = `Active · ${cDays}d`;
            return {
                title: c.title,
                price: formatPrice(c.price),
                rawPrice: c.price,
                pricePerSqft: cPricePerSqft ? `₹${cPricePerSqft.toLocaleString()}` : '—',
                status: statusLabel,
                area: c.details?.area || null,
                floor: c.details?.floor || null,
                furnished: c.details?.furnished || null,
                isYourListing: false
            };
        });

        // Add the current property as "your listing"
        comparableListings.push({
            title: property.title,
            price: formatPrice(property.price),
            rawPrice: property.price,
            pricePerSqft: myPricePerSqft ? `₹${myPricePerSqft.toLocaleString()}` : '—',
            status: `Active · ${days}d`,
            area: area,
            floor: property.details?.floor || null,
            furnished: property.details?.furnished || null,
            isYourListing: true
        });

        // Sort by price
        comparableListings.sort((a, b) => a.rawPrice - b.rawPrice);

        // ── 7. Gemini AI Recommendations ────────────────────────────
        let aiRecommendations = [];
        const safeDevDenom = marketAvgPrice > 0 ? marketAvgPrice : 1;
        const marketDev = effectivePrice > marketAvgPrice
            ? `${Math.round(((effectivePrice - marketAvgPrice) / safeDevDenom) * 100)}% above market average`
            : `${Math.round(((marketAvgPrice - effectivePrice) / safeDevDenom) * 100)}% below market average`;

        try {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (geminiKey && !geminiKey.includes('Placeholder')) {
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const prompt = `You are an expert Indian real estate advisor helping a property owner maximise their sale. 
Analyse the following property data and provide exactly 5 actionable, specific recommendations to boost deal velocity.

Property Details:
- Title: ${property.title}
- Location: ${property.address?.locality}, ${property.address?.city}
- Current Asking Price: ${formatPrice(property.price)}
- Price/sqft: ${myPricePerSqft ? `₹${myPricePerSqft}` : 'N/A'}
- Area: ${area ? `${area} sqft` : 'N/A'}
- Bedrooms: ${bedrooms || 'N/A'}
- Days on market: ${days}
- Enquiries received: ${enquiryCount}
- Photos uploaded: ${property.images?.length || 0}
- Amenities listed: ${property.amenities?.join(', ') || 'None'}
- Listing quality score: ${qualityScore}/100
- Market average price: ${formatPrice(marketAvgPrice)}
- Market deviation: ${marketDev}
- Verified/RERA: ${property.isVerified ? 'Yes' : 'No'}

Computed Pricing Strategy (DO NOT HALUCINATE RANDOM PRICES, ONLY USE THESE IF SUGGESTING A PRICE CHANGE):
- Recommended Price: ${formatPrice(recommendedPrice)} (Matches market rate)
- Fast Sale Price: ${formatPrice(fastSalePrice)} (Below market rate for quick sale)

Return ONLY a JSON array (no markdown, no explanation) like:
[
  { "icon": "₹", "title": "Short action title", "description": "2-3 sentence specific advice mentioning actual numbers and timelines." },
  ...
]

Each recommendation must be specific, actionable, and mention concrete numbers (% improvement, days, ₹ amounts). Focus on: price positioning using ONLY the computed pricing strategy, photo quality, RERA visibility, weekend visits, responding to inquiries.`;

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                // Strip any markdown code fences if present
                const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                aiRecommendations = JSON.parse(jsonText);
            }
        } catch (geminiErr) {
            console.warn('[Analysis] Gemini AI error, using fallback recommendations:', geminiErr.message);
        }

        // ── Fallback recommendations if Gemini fails or key not set ──
        if (!aiRecommendations || aiRecommendations.length === 0) {
            const priceDiffFromRecommended = Math.round(Math.abs(property.price - recommendedPrice) / 100000);
            aiRecommendations = [
                {
                    icon: '₹',
                    title: `Reduce asking price to ${formatPrice(recommendedPrice)}`,
                    description: `At ${formatPrice(effectivePrice)} you are competing with listings that have been stale for 50–74 days. Dropping to ${formatPrice(recommendedPrice)} puts you at market rate, estimated to increase inquiries by 40% and cut time-to-close by half.`
                },
                {
                    icon: '📷',
                    title: 'Add 3 more photos — especially kitchen & bathrooms',
                    description: `Listings with 10+ photos get 2.3× more inquiries. Your current listing has ${property.images?.length || 0}. Kitchen and bathroom shots have the highest impact on buyer intent and can raise your quality score from ${qualityScore} to ${Math.min(qualityScore + 13, 100)}.`
                },
                {
                    icon: '🕐',
                    title: 'Enable weekend visit slots',
                    description: `72% of property visits happen Saturday–Sunday between 10 AM and 1 PM. Opening just two Saturday slots can generate 3–5 new visit requests this week, significantly reducing your days on market.`
                },
                {
                    icon: '🏛️',
                    title: 'Highlight RERA number prominently',
                    description: `Buyers filter for RERA-verified properties first. ${property.isVerified ? 'Your listing is verified — make sure the RERA number appears in the title.' : 'Getting RERA verification can increase your trust score and rank you higher in filtered searches.'}`
                },
                {
                    icon: '💬',
                    title: `Respond to your ${enquiryCount} pending ${enquiryCount === 1 ? 'inquiry' : 'inquiries'} today`,
                    description: `Buyers with high trust scores (76+) who enquire close 70% of the time when the owner responds within 24 hours. Your current ${enquiryCount} ${enquiryCount === 1 ? 'inquiry is' : 'inquiries are'} awaiting response — acting now can dramatically accelerate your sale.`
                }
            ];
        }

        // ── 8. Price spectrum position (0–100%) ─────────────────────
        const priceRange = marketMaxPrice - marketMinPrice;
        const pricePosition = priceRange > 0
            ? Math.round(((effectivePrice - marketMinPrice) / priceRange) * 100)
            : 50;

        const safeDevDenomFinal = marketAvgPrice > 0 ? marketAvgPrice : 1;

        // ── 9. Assemble response ─────────────────────────────────────
        res.json({
            property: {
                id: property._id,
                title: property.title,
                address: property.address,
                price: property.price,
                priceFormatted: formatPrice(property.price),
                area,
                bedrooms,
                images: property.images,
                createdAt: property.createdAt,
                isVerified: property.isVerified
            },
            kpis: {
                pricePerSqft: myPricePerSqft ? `₹${myPricePerSqft.toLocaleString()}` : '—',
                marketAvgPricePerSqft: marketAvgPricePerSqft ? `₹${marketAvgPricePerSqft.toLocaleString()}` : '—',
                daysOnMarket: days,
                avgMarketDays: 45,
                inquiryCount: enquiryCount,
                inquiryBenchmark: enquiryBenchmark,
                qualityScore,
                qualityImprovements
            },
            market: {
                avgPrice: marketAvgPrice,
                avgPriceFormatted: formatPrice(marketAvgPrice),
                minPrice: marketMinPrice,
                minPriceFormatted: formatPrice(marketMinPrice),
                maxPrice: marketMaxPrice,
                maxPriceFormatted: formatPrice(marketMaxPrice),
                pricePosition: Math.max(5, Math.min(95, isNaN(pricePosition) ? 50 : pricePosition)),
                sweetSpotMin: formatPrice(Math.round(marketAvgPrice * 0.93)),
                sweetSpotMax: formatPrice(Math.round(marketAvgPrice * 1.02)),
                cautionMin: formatPrice(Math.round(marketAvgPrice * 1.02)),
                cautionMax: formatPrice(Math.round(marketAvgPrice * 1.11)),
                overpriceAbove: formatPrice(Math.round(marketAvgPrice * 1.11)),
                deviationPct: Math.round(Math.abs(effectivePrice - marketAvgPrice) / safeDevDenomFinal * 100),
                isAboveMarket: effectivePrice > marketAvgPrice
            },
            scenarios,
            aiRecommendations,
            comparableListings,
            generatedAt: new Date().toISOString()
        });

    } catch (err) {
        console.error('[Analysis] Error:', err);
        res.status(500).json({ message: 'Analysis failed', error: err.message });
    }
});

module.exports = router;
