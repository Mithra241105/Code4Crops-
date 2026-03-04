const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Mandi = require('../models/Mandi');
const OptimizationHistory = require('../models/OptimizationHistory');
const PriceRecord = require('../models/PriceRecord');
const TravelPlan = require('../models/TravelPlan');
const { optimizeProfits } = require('../services/optimizationService');
const { VEHICLE_CAPACITY } = require('../services/fuelService');

// All farmer routes require auth + farmer role
router.use(requireAuth, requireRole('farmer'));

// GET /api/farmer/profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash -otp -otpExpiry');
        res.json({ profile: user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/farmer/profile
router.put('/profile', async (req, res) => {
    try {
        const { name, langPref, farmerProfile } = req.body;
        const update = {};
        if (name) update.name = name;
        if (langPref) update.langPref = langPref;
        if (farmerProfile) update.farmerProfile = farmerProfile;

        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-passwordHash -otp -otpExpiry');
        res.json({ profile: user, message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/farmer/optimize
router.post('/optimize', async (req, res) => {
    try {
        const { farmerLat, farmerLng, farmerLocationName, cropType, quantity, vehicleType, travelDate, state } = req.body;
        if (!farmerLat || !farmerLng || !cropType || !quantity || !vehicleType) {
            return res.status(400).json({ error: 'farmerLat, farmerLng, cropType, quantity, vehicleType are required' });
        }

        const mandis = await Mandi.find({ isOpen: true, supportedCrops: cropType });
        if (mandis.length === 0) return res.status(404).json({ error: t ? t('farmer.noMandisForCrop', { crop: t(`crops.${cropType}`) }) : 'No mandis found for this crop' });

        // ── Pooling Logic ──────────────────────────────────────────
        let poolingMatches = [];
        if (travelDate) {
            const capacity = VEHICLE_CAPACITY[vehicleType] || 30;
            // Find plans same date + same vehicle + same mandi
            // Simple rule: if existing quantity + current quantity <= capacity
            const existingPlans = await TravelPlan.find({
                travelDate,
                vehicleType,
                status: 'planned',
                farmerId: { $ne: req.user._id }
            });

            console.log(`[Pooling] Found ${existingPlans.length} potential plans for date ${travelDate}, vehicle ${vehicleType}`);
            // Filter plans where (existing.quantity + current.quantity) <= capacity
            poolingMatches = existingPlans.filter(p => {
                const fits = (p.quantity + Number(quantity)) <= capacity;
                if (!fits) console.log(`[Pooling] Capacity exceeded: ${p.quantity} + ${quantity} > ${capacity}`);
                return fits;
            });
            console.log(`[Pooling] ${poolingMatches.length} plans fit in vehicle capacity ${capacity}`);
        }

        const results = optimizeProfits({
            farmerLat, farmerLng, cropType,
            quantity: Number(quantity), vehicleType, state,
            poolingMatches
        }, mandis);

        if (results.length === 0) return res.status(404).json({ error: `No mandis found offering ${cropType}` });

        // Save to history
        await OptimizationHistory.create({
            userId: req.user._id,
            cropType,
            quantity: Number(quantity),
            vehicleType,
            farmerLocation: { lat: farmerLat, lng: farmerLng, name: farmerLocationName || 'Current Location' },
            results: results.slice(0, 10),
            bestMandi: { name: results[0].mandiName, netProfit: results[0].netProfit },
            fuelPriceUsed: results[0].fuelPrice,
        });

        res.json({ results, count: results.length, bestMandi: results[0] });
    } catch (err) {
        console.error('/optimize error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/farmer/travel-plan — Farmer commits to a travel plan
router.post('/travel-plan', async (req, res) => {
    try {
        const { crop, quantity, mandiId, vehicleType, travelDate, location } = req.body;
        if (!crop || !quantity || !mandiId || !vehicleType || !travelDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const plan = await TravelPlan.create({
            farmerId: req.user._id,
            crop,
            quantity: Number(quantity),
            mandiId,
            vehicleType,
            travelDate,
            location
        });

        res.json({ plan, message: 'Travel plan created successfully' });
    } catch (err) {
        console.error('/travel-plan error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/farmer/travel-plans — Get farmer's booked trips with pooling matches
router.get('/travel-plans', async (req, res) => {
    try {
        const plans = await TravelPlan.find({
            farmerId: req.user._id,
            status: { $ne: 'cancelled' }
        })
            .populate('mandiId', 'name location phone')
            .sort({ travelDate: 1 });

        // Filter out plans where mandiId is null (orphaned after deletion)
        const validPlans = plans.filter(p => p.mandiId);

        // Enrich with pooling info
        const enrichedPlans = await Promise.all(validPlans.map(async (plan) => {
            const partners = await TravelPlan.find({
                mandiId: plan.mandiId._id,
                travelDate: plan.travelDate,
                vehicleType: plan.vehicleType,
                farmerId: { $ne: req.user._id },
                status: 'planned'
            }).populate('farmerId', 'name farmerProfile.phone').populate('mandiId', 'name');

            return {
                ...plan.toObject(),
                poolingCount: partners.length,
                poolingPartners: partners.map(p => ({
                    name: p.farmerId?.name || 'Unknown Farmer',
                    phone: p.farmerId?.farmerProfile?.phone || 'N/A',
                    quantity: p.quantity,
                    crop: p.crop,
                    vehicleType: p.vehicleType,
                    from: p.location?.name || 'Unknown',
                    to: p.mandiId?.name || 'Mandi'
                }))
            };
        }));

        res.json({ plans: enrichedPlans });
    } catch (err) {
        console.error('/travel-plans error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/farmer/trips/:id
router.put('/trips/:id', async (req, res) => {
    try {
        const { travelDate, vehicleType, quantity } = req.body;
        const plan = await TravelPlan.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.user._id },
            { $set: { travelDate, vehicleType, quantity: Number(quantity) } },
            { new: true }
        ).populate('mandiId', 'name location');

        if (!plan) return res.status(404).json({ error: 'Trip not found or unauthorized' });
        res.json({ message: 'Trip updated successfully', plan });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/farmer/trips/:id
router.delete('/trips/:id', async (req, res) => {
    try {
        const plan = await TravelPlan.findOneAndDelete({ _id: req.params.id, farmerId: req.user._id });
        if (!plan) return res.status(404).json({ error: 'Trip not found or unauthorized' });
        res.json({ message: 'Trip cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/farmer/history
router.get('/history', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = await OptimizationHistory.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);
        const total = await OptimizationHistory.countDocuments({ userId: req.user._id });
        res.json({ history, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/farmer/insights/:crop — get historical price breakdown by weekday
router.get('/insights/:crop', async (req, res) => {
    try {
        const { crop } = req.params;

        const insights = await PriceRecord.aggregate([
            { $match: { crop: crop } },
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: "$timestamp" },
                    price: 1
                }
            },
            {
                $group: {
                    _id: "$dayOfWeek",
                    avgPrice: { $avg: "$price" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const days = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const output = insights.map(i => ({
            day: days[i._id],
            avgPrice: Math.round(i.avgPrice),
            count: i.count
        }));

        res.json({ insights: output });
    } catch (err) {
        console.error('/insights error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
