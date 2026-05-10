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

module.exports = router;
