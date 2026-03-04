const mongoose = require('mongoose');
require('dotenv').config();
const Mandi = require('./models/Mandi');

const seedVolatilityData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const mandi = await Mandi.findOne({ isOpen: true });
        if (!mandi) {
            console.error('No mandi found.');
            process.exit(1);
        }

        const crop = 'wheat';
        // Falling trend: day1(current) < day2 < day3
        // Price History is prepended: [day1, day2, day3]
        const fallingHistory = [2300, 2400, 2500];

        mandi.cropPrices.set(crop, 2300);
        mandi.priceHistory.set(crop, fallingHistory);

        await mandi.save();

        console.log(`Mock volatility data seeded for mandi: ${mandi.name}`);
        console.log(`Crop: ${crop}, History: ${fallingHistory.join(' > ')} (Falling)`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding volatility data:', err);
        process.exit(1);
    }
};

seedVolatilityData();
