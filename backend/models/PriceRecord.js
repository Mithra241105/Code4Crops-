const mongoose = require('mongoose');

const priceRecordSchema = new mongoose.Schema({
    mandiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mandi',
        required: true
    },
    crop: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for fast aggregation by crop and timestamp
priceRecordSchema.index({ crop: 1, timestamp: -1 });

module.exports = mongoose.model('PriceRecord', priceRecordSchema);
