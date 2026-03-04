const mongoose = require('mongoose');

const travelPlanSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    mandiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mandi',
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    travelDate: {
        type: String, // String format 'YYYY-MM-DD' for easy matching
        required: true
    },
    location: {
        lat: Number,
        lng: Number,
        name: String
    },
    status: {
        type: String,
        enum: ['planned', 'completed', 'cancelled'],
        default: 'planned'
    }
}, { timestamps: true });

// Index for fast matching on travel date, mandi and vehicle
travelPlanSchema.index({ travelDate: 1, mandiId: 1, vehicleType: 1 });

module.exports = mongoose.model('TravelPlan', travelPlanSchema);
