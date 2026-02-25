const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Mandi = require('../models/Mandi');
const OptimizationHistory = require('../models/OptimizationHistory');
const { optimizeProfits } = require('../services/optimizationService');

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
        const { farmerLat, farmerLng, farmerLocationName, cropType, quantity, vehicleType, state } = req.body;
        if (!farmerLat || !farmerLng || !cropType || !quantity || !vehicleType) {
            return res.status(400).json({ error: 'farmerLat, farmerLng, cropType, quantity, vehicleType are required' });
        }

        const mandis = await Mandi.find({ isOpen: true });
        if (mandis.length === 0) return res.status(404).json({ error: 'No active mandis found' });

        const results = optimizeProfits({ farmerLat, farmerLng, cropType, quantity: Number(quantity), vehicleType, state }, mandis);
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

module.exports = router;
