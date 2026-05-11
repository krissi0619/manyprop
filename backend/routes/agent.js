const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Property = require('../models/Property');
const Enquiry = require('../models/Enquiry');
const Offer = require('../models/Offer');
const User = require('../models/User');

router.get('/:userId/dashboard', async (req, res) => {
    try {
        const agentId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Verify user is an agent
        const agent = await User.findById(agentId);
        if (!agent || (agent.userType !== 'Agent' && agent.role !== 'agent')) {
            return res.status(403).json({ error: 'User is not an agent' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Active Listings
        const activeListings = await Property.countDocuments({ owner: agentId, status: { $ne: 'sold' } });

        // 2. Deals Closed (MTD) & Total Commission
        // We assume 2% standard commission on agreedPrice if missing tokenAmount math
        const mtdOffers = await Offer.find({ 
            seller: agentId, 
            status: 'deal_done', 
            updatedAt: { $gte: startOfMonth }
        });
        
        const dealsClosedMTD = mtdOffers.length;
        const commissionMTD = mtdOffers.reduce((sum, offer) => sum + ((offer.agreedPrice || offer.offerPrice) * 0.02), 0);

        // 3. Last 6 Months Commission Data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0,0,0,0);

        const recentDeals = await Offer.find({
            seller: agentId,
            status: 'deal_done',
            updatedAt: { $gte: sixMonthsAgo }
        });

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            months.push({
                label: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                earned: 0
            });
        }

        recentDeals.forEach(deal => {
            const dDate = new Date(deal.updatedAt);
            const targetMonth = months.find(m => m.monthIndex === dDate.getMonth() && m.year === dDate.getFullYear());
            if (targetMonth) {
                targetMonth.earned += ((deal.agreedPrice || deal.offerPrice) * 0.02);
            }
        });

        // 4. Hot Leads
        // Get all enquiries for agent's properties
        const agentProperties = await Property.find({ owner: agentId }).select('_id');
        const propertyIds = agentProperties.map(p => p._id);
        
        const allEnquiries = await Enquiry.find({ property: { $in: propertyIds } }).populate('property', 'title address price');
        
        // Group leads by phone or email
        const leadsMap = {};
        allEnquiries.forEach(enq => {
            const key = enq.senderPhone || enq.senderEmail;
            if (!key) return;
            if (!leadsMap[key]) {
                leadsMap[key] = {
                    id: enq._id,
                    name: enq.senderName,
                    phone: enq.senderPhone,
                    interactions: 0,
                    lastInteraction: enq.createdAt,
                    properties: new Set(),
                    latestEnquiry: enq
                };
            }
            leadsMap[key].interactions += 1;
            leadsMap[key].properties.add(enq.property?._id?.toString());
            if (new Date(enq.createdAt) > new Date(leadsMap[key].lastInteraction)) {
                leadsMap[key].lastInteraction = enq.createdAt;
                leadsMap[key].latestEnquiry = enq;
            }
        });

        const activeLeadsCount = Object.keys(leadsMap).length;
        const hotLeads = Object.values(leadsMap)
            .sort((a, b) => b.interactions - a.interactions)
            .slice(0, 5)
            .map(l => ({
                id: l.id,
                name: l.name,
                phone: l.phone,
                matchScore: Math.min(60 + (l.interactions * 10), 98), // Mock score
                status: l.interactions > 2 ? 'Active chat' : 'New',
                context: `${l.interactions} interactions • Last on ${new Date(l.lastInteraction).toLocaleDateString()}`,
                targetProperty: l.latestEnquiry?.property?.title || 'Unknown Property'
            }));

        // 5. Pipeline Breakdown
        const allOffers = await Offer.find({ seller: agentId }).populate('property', 'title address');
        const pipeline = {
            stages: { new: 0, visit: 0, negotiation: 0, closing: 0 },
            deals: [],
            totalValue: 0
        };

        allOffers.forEach(offer => {
            let stage = 'new';
            if (offer.status === 'deal_done') return; // Exclude finished
            if (offer.status === 'accepted' || offer.tokenPaid) stage = 'closing';
            else if (offer.status === 'countered') stage = 'negotiation';
            else if (offer.visitStatus === 'scheduled' || offer.visitStatus === 'completed') stage = 'visit';

            pipeline.stages[stage]++;
            pipeline.totalValue += ((offer.agreedPrice || offer.offerPrice) * 0.02);

            pipeline.deals.push({
                id: offer._id,
                propertyTitle: offer.property?.title || 'Unknown',
                buyerName: offer.buyerName || 'Client',
                price: offer.agreedPrice || offer.offerPrice,
                stage: stage
            });
        });

        pipeline.deals.sort((a, b) => b.price - a.price);

        // 6. Today's Schedule
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const todaysVisits = allEnquiries
            .filter(e => e.type === 'visit' && e.visitDate === todayStr)
            .map(e => ({
                id: e._id,
                time: e.visitTime || 'TBD',
                title: `Site visit — ${e.property?.title || 'Property'}`,
                with: e.senderName,
                type: 'visit'
            }));

        // Build Response Payload
        res.json({
            stats: {
                activeListings,
                activeLeads: activeLeadsCount,
                dealsClosedMTD,
                commissionMTD
            },
            commissionChart: months,
            hotLeads,
            pipeline,
            schedule: todaysVisits,
            aiAlert: hotLeads.length > 0 
                ? `Lead ${hotLeads[0].name} is a ${hotLeads[0].matchScore}% match for ${hotLeads[0].targetProperty}. They've interacted ${hotLeads[0].interactions} times recently. Contact them now to close.`
                : null
        });

    } catch (err) {
        console.error('Agent dashboard error:', err);
        res.status(500).json({ error: 'Server error fetching agent dashboard' });
    }
});

router.get('/:userId/leads', async (req, res) => {
    try {
        const agentId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Get agent's properties
        const agentProperties = await Property.find({ owner: agentId }).select('_id title address price propertyType bhkTypes details');
        const propertyIds = agentProperties.map(p => p._id);
        
        // Get all enquiries for these properties
        const allEnquiries = await Enquiry.find({ property: { $in: propertyIds } }).populate('property', 'title address price propertyType bhkTypes details').sort({ createdAt: -1 });
        
        const leadsMap = {};
        allEnquiries.forEach(enq => {
            const key = enq.senderPhone || enq.senderEmail;
            if (!key) return;
            
            if (!leadsMap[key]) {
                const prop = enq.property || {};
                
                // Mocks and mappings to match UI designs
                const interactions = 1;
                const matchScore = Math.floor(Math.random() * 25) + 70; // 70-95
                const propPrice = prop.price || 8500000;
                const budgetLower = Math.max(1000000, propPrice - 1000000);
                const budgetUpper = propPrice + 1000000;
                
                const formatL = (v) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : `₹${(v/100000).toFixed(0)}L`;
                const budgetStr = `Budget ${formatL(budgetLower)}-${formatL(budgetUpper)}`;
                
                const bhk = prop.details?.bedrooms || prop.bhkTypes?.[0]?.split(' ')?.[0] || '2/3';
                const location = prop.address?.locality || 'Locality';
                const occupations = ['Self-employed', 'IT professional', 'Business owner', 'Salaried', 'Teacher', 'NRI'];
                const occupation = occupations[Math.floor(Math.random() * occupations.length)];
                
                // Determine group/type based on random/interactions
                const r = Math.random();
                let statusBadge, statusBadgeType, badges, aiInsight, actionText, actionLink;
                
                if (r > 0.8) {
                    statusBadge = 'Action needed';
                    statusBadgeType = 'action-needed';
                    badges = [
                        { text: 'Verified KYC', color: 'green' },
                        { text: 'Home loan pre-approved', color: 'blue' },
                        { text: 'Deciding in 2 weeks', color: 'yellow' }
                    ];
                    aiInsight = `${enq.senderName} matches your ${location} listing at ${matchScore}% — budget, BHK, location all align. She's pre-approved for a home loan and her behaviour signals strong intent. Every hour without contact increases drop-off risk.`;
                    actionText = 'Contact ↗';
                    actionLink = 'Draft message ↗';
                } else if (r > 0.5) {
                    statusBadge = 'Active chat';
                    statusBadgeType = 'active';
                    badges = [
                        { text: 'Verified KYC', color: 'green' },
                        { text: 'Visit scheduled', color: 'gray' }
                    ];
                    aiInsight = `${enq.senderName} is actively engaged. The scheduled visit is a prime opportunity to close. Ensure all documents are ready.`;
                    actionText = 'Chat ↗';
                    actionLink = 'Prepare for visit ↗';
                } else if (r > 0.3) {
                    statusBadge = 'Follow-up overdue';
                    statusBadgeType = 'action-needed';
                    badges = [
                        { text: 'Verified KYC', color: 'green' },
                        { text: '2 visits done', color: 'gray' },
                        { text: 'Comparing 3 properties', color: 'yellow' }
                    ];
                    aiInsight = `${enq.senderName} did his 2nd visit but hasn't messaged. Buyers who go silent after a 2nd visit are 60% more likely to be comparing with a competitor listing. Strike while warm — a simple check-in message can re-anchor his decision.`;
                    actionText = 'Follow up ↗';
                    actionLink = 'Draft follow-up ↗';
                } else {
                    statusBadge = 'New · High intent';
                    statusBadgeType = 'new';
                    badges = [
                        { text: 'Home loan pre-approved', color: 'blue' },
                        { text: 'Onboarding today 4:30 PM', color: 'yellow' }
                    ];
                    aiInsight = `New lead with pre-approval. Highest close probability in your pipeline right now. Gap is only ₹2L — closeable today.`;
                    actionText = 'Prep session ↗';
                    actionLink = 'Prep brief ↗';
                }

                leadsMap[key] = {
                    id: enq._id,
                    name: enq.senderName,
                    phone: enq.senderPhone,
                    email: enq.senderEmail,
                    initials: enq.senderName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
                    statusBadge,
                    statusBadgeType,
                    matchScore,
                    budgetStr,
                    bhkStr: `${bhk} BHK`,
                    location,
                    occupation,
                    badges,
                    stats: [
                        { icon: 'eye', text: `Viewed ${location} listing 3× in 48 hrs` },
                        { icon: 'heart', text: `Shortlisted ${Math.floor(Math.random()*4)+1} properties` }
                    ],
                    lastActive: enq.createdAt,
                    aiInsight,
                    actionText,
                    actionLink,
                    interactions: 1
                };
            } else {
                leadsMap[key].interactions += 1;
                if (new Date(enq.createdAt) > new Date(leadsMap[key].lastActive)) {
                    leadsMap[key].lastActive = enq.createdAt;
                }
            }
        });
        
        let leadsList = Object.values(leadsMap).sort((a,b) => new Date(b.lastActive) - new Date(a.lastActive));
        
        // Stats
        const totalLeads = leadsList.length;
        const hotCount = leadsList.filter(l => l.statusBadgeType === 'active').length;
        const actionNeededCount = leadsList.filter(l => l.statusBadgeType === 'action-needed').length;
        const warmCount = Math.floor(totalLeads / 3);
        const newCount = leadsList.filter(l => l.statusBadgeType === 'new').length;
        
        res.json({
            stats: {
                total: totalLeads,
                hot: hotCount,
                actionNeeded: actionNeededCount,
                warm: warmCount,
                new: newCount
            },
            leads: leadsList
        });

    } catch (err) {
        console.error('Fetch leads error:', err);
        res.status(500).json({ error: 'Server error fetching leads' });
    }
});

router.get('/:userId/pipeline', async (req, res) => {
    try {
        const agentId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Get agent's properties
        const agentProperties = await Property.find({ owner: agentId }).select('_id title address price propertyType bhkTypes details');
        const propertyIds = agentProperties.map(p => p._id);
        
        // Get enquiries and offers
        const enquiries = await Enquiry.find({ property: { $in: propertyIds } }).populate('property', 'title address price bhkTypes details').sort({ createdAt: -1 });
        const offers = await Offer.find({ seller: agentId }).populate('property', 'title address price bhkTypes details').sort({ updatedAt: -1 });
        
        // Group items into columns
        const columns = {
            newLeads: { id: 'newLeads', title: 'New leads', items: [] },
            contacted: { id: 'contacted', title: 'Contacted', items: [] },
            visitScheduled: { id: 'visitScheduled', title: 'Visit scheduled', items: [] },
            offerStage: { id: 'offerStage', title: 'Offer stage', items: [] },
            closed: { id: 'closed', title: 'Closed', items: [] },
            lost: { id: 'lost', title: 'Lost', items: [] }
        };

        const formatL = (v) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : `₹${(v/100000).toFixed(0)}L`;
        
        const createCardFromEnq = (enq, statusType) => {
            const prop = enq.property || {};
            const bhk = prop.details?.bedrooms || prop.bhkTypes?.[0]?.split(' ')?.[0] || '2/3';
            const location = prop.address?.locality || 'Locality';
            const propPrice = prop.price || 8500000;
            const matchScore = Math.floor(Math.random() * 25) + 70; // Mock score

            let badges = [];
            if (statusType === 'new') {
                badges = [{ text: 'Match ' + matchScore + '%', color: 'orange' }, { text: 'Onboarding 4:30 PM', color: 'gray' }];
            } else if (statusType === 'contacted') {
                badges = [{ text: matchScore + '% · Loan approved', color: 'orange' }];
            } else if (statusType === 'visit') {
                badges = [{ text: enq.status === 'seen' ? 'Confirmed' : 'Pending', color: enq.status === 'seen' ? 'green' : 'yellow' }];
            }

            return {
                id: 'enq_' + enq._id,
                name: enq.senderName,
                details: `${bhk}BHK · ${location} · ${formatL(Math.max(1000000, propPrice - 1000000))}-${formatL(propPrice + 1000000)}`,
                type: statusType,
                badges,
                createdAt: enq.createdAt,
                visitDate: enq.visitDate,
                visitTime: enq.visitTime
            };
        };

        const createCardFromOffer = (offer, statusType) => {
            const prop = offer.property || {};
            const bhk = prop.details?.bedrooms || prop.bhkTypes?.[0]?.split(' ')?.[0] || '2/3';
            const location = prop.address?.locality || 'Locality';
            const offerPrice = offer.agreedPrice || offer.offerPrice;
            const listedPrice = prop.price || offerPrice;

            let badges = [];
            if (statusType === 'offer') {
                badges = [{ text: 'Expires 6 PM', color: 'red' }];
            } else if (statusType === 'closed') {
                badges = [{ text: 'Deal done', color: 'green' }];
            } else if (statusType === 'lost') {
                badges = [{ text: 'Lost', color: 'red' }];
            }

            return {
                id: 'off_' + offer._id,
                name: offer.buyerName || 'Client',
                details: `${location} · ${bhk}BHK · Listed ${formatL(listedPrice)}`,
                offerInfo: `Offer ${formatL(offerPrice)} · Gap ${formatL(Math.abs(listedPrice - offerPrice))}`,
                type: statusType,
                badges,
                updatedAt: offer.updatedAt
            };
        };

        // Categorize Enquiries
        const processedEnqPhones = new Set();
        enquiries.forEach(enq => {
            const key = enq.senderPhone || enq.senderEmail;
            if (processedEnqPhones.has(key)) return; // Only process latest per user for leads
            processedEnqPhones.add(key);

            if (enq.type === 'visit') {
                columns.visitScheduled.items.push(createCardFromEnq(enq, 'visit'));
            } else if (enq.status === 'seen' || enq.status === 'done') {
                columns.contacted.items.push(createCardFromEnq(enq, 'contacted'));
            } else {
                columns.newLeads.items.push(createCardFromEnq(enq, 'new'));
            }
        });

        // Categorize Offers
        offers.forEach(offer => {
            if (offer.status === 'rejected') {
                columns.lost.items.push(createCardFromOffer(offer, 'lost'));
            } else if (offer.status === 'deal_done' || offer.status === 'accepted') {
                columns.closed.items.push(createCardFromOffer(offer, 'closed'));
            } else {
                columns.offerStage.items.push(createCardFromOffer(offer, 'offer'));
            }
        });

        res.json({ columns });

    } catch (err) {
        console.error('Fetch pipeline error:', err);
        res.status(500).json({ error: 'Server error fetching pipeline' });
    }
});

module.exports = router;
