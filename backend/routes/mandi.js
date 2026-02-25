const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const Mandi = require('../models/Mandi');
const User = require('../models/User');

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

        await mandi.save();
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

        if (price !== undefined) mandi.cropPrices.set(cropId, Number(price));

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
                mandi.cropPrices.set(crop, Number(price));
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

        res.json({
            analytics: {
                mandiName: mandi.name,
                demandScore: mandi.demandScore,
                isOpen: mandi.isOpen,
                cropCount: mandi.supportedCrops.length,
                cropPrices: pricesObj,
                handlingRate: mandi.handlingRate,
                location: mandi.location,
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
