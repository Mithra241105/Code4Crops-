const mongoose = require('mongoose');

const optimizationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropType: { type: String, required: true },
    quantity: { type: Number, required: true }, // quintals
    vehicleType: { type: String, required: true },
    farmerLocation: {
        lat: Number,
        lng: Number,
        name: String,
    },
    results: [{
        mandiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandi' },
        mandiName: String,
        distance: Number, // km
        cropPrice: Number, // ₹/quintal
        revenue: Number,
        transportCost: Number,
        handlingCost: Number,
        netProfit: Number,
        rank: Number,
    }],
    bestMandi: {
        name: String,
        netProfit: Number,
    },
    fuelPriceUsed: Number,
}, { timestamps: true });

module.exports = mongoose.model('OptimizationHistory', optimizationSchema);
