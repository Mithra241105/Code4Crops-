const mongoose = require('mongoose');

const mandiSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mandiId: { type: String, unique: true },
    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: String,
        city: String,
        district: String,
        state: String,
    },
    // Crop prices: { wheat: 2500, rice: 3000, ... } in ₹ per quintal
    cropPrices: {
        type: Map,
        of: Number,
        default: {},
    },
    // Supported crops
    supportedCrops: [String],
    // Handling charge per quintal (₹)
    handlingRate: { type: Number, default: 150 },
    // Availability
    isOpen: { type: Boolean, default: true },
    operatingDays: [String], // ['Mon','Tue',...]
    operatingHours: String,
    // Analytics
    demandScore: { type: Number, default: 50 }, // 0-100
    avgDailyVolume: Number, // quintals
    phone: String,
    description: String,
}, { timestamps: true });

module.exports = mongoose.model('Mandi', mandiSchema);
