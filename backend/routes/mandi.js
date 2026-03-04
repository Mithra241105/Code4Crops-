const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const Mandi = require('../models/Mandi');
const User = require('../models/User');
const PriceRecord = require('../models/PriceRecord');

// Public: list all active mandis
router.get('/list', async (req, res) => {
    try {
        const { crop } = req.query;
        let query = { isOpen: true };
        if (crop) query.supportedCrops = crop;
        const mandis = await Mandi.find(query).select('name location cropPrices supportedCrops handlingRate isOpen demandScore phone');
        res.json({ mandis });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Public: get a single mandi
router.get('/:id', async (req, res) => {
    try {
        const mandi = await Mandi.findById(req.params.id).select('-adminUser');
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });
        res.json({ mandi });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Protected mandi admin routes below ---
router.use(requireAuth, requireRole('mandi'));

// --- Granular Crop Management Routes ---

// GET /api/mandi/crops
router.get('/crops', async (req, res) => {
    try {
        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        const priceObj = {};
        mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });

        const crops = mandi.supportedCrops.map(crop => ({
            id: crop,
            name: crop,
            price: priceObj[crop] || 0,
            available: true
        }));

        res.json({ crops });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/mandi/crops
router.post('/crops', async (req, res) => {
    try {
        const { name, price, available } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        mandi.cropPrices.set(name, Number(price));
        if (!mandi.supportedCrops.includes(name)) {
            mandi.supportedCrops.push(name);
        }

        // Initialize price history
        const history = mandi.priceHistory.get(name) || [];
        mandi.priceHistory.set(name, [Number(price), ...history].slice(0, 3));

        await mandi.save();

        // Log historical price record
        await PriceRecord.create({
            mandiId: mandi._id,
            crop: name,
            price: Number(price)
        });

        res.status(201).json({ message: 'Crop added', crop: { id: name, name, price, available: true } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/mandi/crops/:id
router.put('/crops/:id', async (req, res) => {
    try {
        const { price, available } = req.body;
        const cropId = req.params.id;

        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        if (price !== undefined) {
            const numPrice = Number(price);
            mandi.cropPrices.set(cropId, numPrice);
            // Update history
            const history = mandi.priceHistory.get(cropId) || [];
            if (history[0] !== numPrice) {
                mandi.priceHistory.set(cropId, [numPrice, ...history].slice(0, 3));
                // Log historical price record
                await PriceRecord.create({
                    mandiId: mandi._id,
                    crop: cropId,
                    price: numPrice
                });
            }
        }

        // If 'available' is false, we might want to remove it from supportedCrops 
        // but keep it in the map, OR keep it in both but mark as unavailable (not in schema yet)
        if (available === false) {
            mandi.supportedCrops = mandi.supportedCrops.filter(c => c !== cropId);
        } else if (available === true && !mandi.supportedCrops.includes(cropId)) {
            mandi.supportedCrops.push(cropId);
        }

        await mandi.save();
        res.json({ message: 'Crop updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/mandi/crops/:id
router.delete('/crops/:id', async (req, res) => {
    try {
        const cropId = req.params.id;
        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        mandi.cropPrices.delete(cropId);
        mandi.supportedCrops = mandi.supportedCrops.filter(c => c !== cropId);

        await mandi.save();
        res.json({ message: 'Crop deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/mandi/admin/profile
router.get('/admin/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash -otp -otpExpiry');
        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        // Serialize cropPrices Map → plain object for JSON
        let mandiData = null;
        if (mandi) {
            mandiData = mandi.toObject();
            if (mandi.cropPrices instanceof Map) {
                const priceObj = {};
                mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });
                mandiData.cropPrices = priceObj;
            }
        }
        res.json({ profile: user, mandi: mandiData });
    } catch (err) {
        console.error('/admin/profile GET error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/mandi/admin/profile — saves all profile + mandi fields
router.put('/admin/profile', async (req, res) => {
    try {
        const { name, langPref, mandiData } = req.body;

        // 1. Update the User document
        const userUpdate = {};
        if (name) userUpdate.name = name;
        if (langPref) userUpdate.langPref = langPref;
        const user = await User.findByIdAndUpdate(req.user._id, userUpdate, { new: true })
            .select('-passwordHash -otp -otpExpiry');

        // 2. Update (or create) the linked Mandi document
        let mandi = null;
        if (mandiData) {
            const {
                mandiName, phone, licenseNumber, operatingHours,
                handlingRate, isOpen, location,
            } = mandiData;

            const mandiUpdate = {
                adminUser: req.user._id,
                ...(mandiName && { name: mandiName }),
                ...(phone !== undefined && { phone }),
                ...(licenseNumber !== undefined && { licenseNumber: licenseNumber || undefined }),
                ...(operatingHours !== undefined && { operatingHours }),
                ...(handlingRate !== undefined && { handlingRate: Number(handlingRate) }),
                ...(isOpen !== undefined && { isOpen }),
                ...(location && location.lat && { location }),
            };

            mandi = await Mandi.findOneAndUpdate(
                { adminUser: req.user._id },
                { $set: mandiUpdate },
                { new: true, upsert: true }
            );
        } else {
            mandi = await Mandi.findOne({ adminUser: req.user._id });
        }

        // Serialize cropPrices Map
        let mandiOut = null;
        if (mandi) {
            mandiOut = mandi.toObject();
            if (mandi.cropPrices instanceof Map) {
                const priceObj = {};
                mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });
                mandiOut.cropPrices = priceObj;
            }
        }

        res.json({ profile: user, mandi: mandiOut, message: 'Profile updated' });
    } catch (err) {
        console.error('/admin/profile PUT error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/mandi/admin/prices — update crop prices and handling rate
router.put('/admin/prices', async (req, res) => {
    try {
        const { cropPrices, supportedCrops, handlingRate } = req.body;
        let mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found. Please complete your profile first.' });

        // Clear and fully rebuild the cropPrices Map so deleted crops are removed
        mandi.cropPrices = new Map();
        if (cropPrices) {
            for (const [crop, price] of Object.entries(cropPrices)) {
                const numPrice = Number(price);
                mandi.cropPrices.set(crop, numPrice);

                // Update history if price changed
                const history = mandi.priceHistory.get(crop) || [];
                if (history[0] !== numPrice) {
                    mandi.priceHistory.set(crop, [numPrice, ...history].slice(0, 3));
                    // Log historical price record
                    await PriceRecord.create({
                        mandiId: mandi._id,
                        crop,
                        price: numPrice
                    });
                }
            }
        }
        if (supportedCrops !== undefined) mandi.supportedCrops = supportedCrops;
        if (handlingRate !== undefined) mandi.handlingRate = Number(handlingRate);
        await mandi.save();

        // Return serialized cropPrices
        const mandiOut = mandi.toObject();
        const priceObj = {};
        mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });
        mandiOut.cropPrices = priceObj;

        res.json({ mandi: mandiOut, message: 'Prices updated successfully' });
    } catch (err) {
        console.error('/admin/prices PUT error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// PUT /api/mandi/admin/availability
router.put('/admin/availability', async (req, res) => {
    try {
        const { isOpen, operatingDays, operatingHours, handlingRate } = req.body;
        const updateFields = {};
        if (isOpen !== undefined) updateFields.isOpen = isOpen;
        if (operatingDays) updateFields.operatingDays = operatingDays;
        if (operatingHours) updateFields.operatingHours = operatingHours;
        if (handlingRate !== undefined) updateFields.handlingRate = Number(handlingRate);

        const mandi = await Mandi.findOneAndUpdate(
            { adminUser: req.user._id },
            { $set: updateFields },
            { new: true }
        );
        if (!mandi) return res.status(404).json({ error: 'Mandi not found. Complete your profile first.' });

        const mandiOut = mandi.toObject();
        const priceObj = {};
        mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });
        mandiOut.cropPrices = priceObj;

        res.json({ mandi: mandiOut, message: 'Availability updated' });
    } catch (err) {
        console.error('/admin/availability PUT error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/mandi/status — simple toggle for isOpen
router.patch('/status', async (req, res) => {
    try {
        const { isOpen } = req.body;
        if (isOpen === undefined) return res.status(400).json({ error: 'isOpen field required' });

        const mandi = await Mandi.findOneAndUpdate(
            { adminUser: req.user._id },
            { $set: { isOpen: !!isOpen } },
            { new: true }
        );
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        res.json({ mandi, message: 'Status updated successfully' });
    } catch (err) {
        console.error('/api/mandi/status PATCH error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/mandi/admin/location
router.put('/admin/location', async (req, res) => {
    try {
        const { lat, lng, address, city, district, state } = req.body;
        if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
        const mandi = await Mandi.findOneAndUpdate(
            { adminUser: req.user._id },
            { $set: { location: { lat, lng, address, city, district, state } } },
            { new: true }
        );
        if (!mandi) return res.status(404).json({ error: 'Mandi not found. Complete your profile first.' });

        const mandiOut = mandi.toObject();
        const priceObj = {};
        mandi.cropPrices.forEach((val, key) => { priceObj[key] = val; });
        mandiOut.cropPrices = priceObj;

        res.json({ mandi: mandiOut, message: 'Location updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/mandi/admin/analytics
router.get('/admin/analytics', async (req, res) => {
    try {
        const mandi = await Mandi.findOne({ adminUser: req.user._id });
        if (!mandi) return res.status(404).json({ error: 'Mandi not found' });

        const pricesObj = {};
        mandi.cropPrices.forEach((val, key) => { pricesObj[key] = val; });

        // --- Hot Crops: top 5 crops by price within this mandi ---
        const cropPriceEntries = Object.entries(pricesObj).sort((a, b) => b[1] - a[1]);
        const hotCrops = cropPriceEntries.slice(0, 5).map(([crop, price]) => ({ crop, price }));

        // --- Price Trend from priceHistory (last 3 snapshots) ---
        const priceTrends = {};
        mandi.priceHistory.forEach((history, crop) => {
            if (history && history.length >= 2) {
                const change = history[0] - history[1]; // current - previous
                const changePct = history[1] > 0 ? ((change / history[1]) * 100).toFixed(1) : 0;
                priceTrends[crop] = {
                    current: history[0],
                    previous: history[1],
                    change,
                    changePct: parseFloat(changePct),
                    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
                };
            }
        });

        // --- Market Competition: compare with nearby mandis in same state ---
        const stateMandis = await Mandi.find({
            'location.state': mandi.location.state,
            _id: { $ne: mandi._id },
            isOpen: true
        }).select('name cropPrices demandScore avgDailyVolume supportedCrops');

        // Build price suggestions: if this mandi's price is < avg state price for a crop, suggest raising
        const priceSuggestions = [];
        const cropCount = {};
        const cropTotal = {};
        stateMandis.forEach(sm => {
            sm.cropPrices.forEach((price, crop) => {
                if (!cropCount[crop]) { cropCount[crop] = 0; cropTotal[crop] = 0; }
                cropCount[crop]++;
                cropTotal[crop] += price;
            });
        });

        Object.keys(pricesObj).forEach(crop => {
            if (cropCount[crop] && cropCount[crop] > 0) {
                const stateAvg = Math.round(cropTotal[crop] / cropCount[crop]);
                const myPrice = pricesObj[crop];
                const diff = myPrice - stateAvg;
                const diffPct = stateAvg > 0 ? Math.round((diff / stateAvg) * 100) : 0;
                if (Math.abs(diffPct) >= 1) { // Only suggest if more than 1% off
                    priceSuggestions.push({
                        crop,
                        myPrice,
                        stateAvg,
                        diff,
                        diffPct,
                        suggestion: diff < 0
                            ? `Raise by ₹${Math.abs(diff)} to match state average`
                            : `You're ₹${diff} above state avg - competitive!`,
                        action: diff < 0 ? 'raise' : 'competitive',
                    });
                }
            }
        });
        priceSuggestions.sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct));

        // --- State rank by demand score ---
        const allStateRanks = await Mandi.find({ 'location.state': mandi.location.state })
            .sort({ demandScore: -1 }).select('_id name demandScore');
        const myRank = allStateRanks.findIndex(m => m._id.toString() === mandi._id.toString()) + 1;

        // --- Total incoming volume estimate (simulate based on demandScore + avgDailyVolume) ---
        const estimatedVolume = mandi.avgDailyVolume || Math.round(mandi.demandScore * 150);
        const peakCropVolumes = hotCrops.map(({ crop }) => ({
            crop,
            volume: Math.round(estimatedVolume * (0.1 + Math.random() * 0.2)),
        }));

        res.json({
            analytics: {
                mandiName: mandi.name,
                demandScore: mandi.demandScore,
                isOpen: mandi.isOpen,
                cropCount: mandi.supportedCrops.length,
                cropPrices: pricesObj,
                handlingRate: mandi.handlingRate,
                location: mandi.location,
                avgDailyVolume: estimatedVolume,
                hotCrops,
                priceTrends,
                priceSuggestions: priceSuggestions.slice(0, 6),
                stateRank: myRank,
                totalMandisInState: allStateRanks.length,
                peakCropVolumes,
                stateMandisCount: stateMandis.length,
            }
        });
    } catch (err) {
        console.error('/admin/analytics error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
