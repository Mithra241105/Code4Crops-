const mongoose = require('mongoose');
require('dotenv').config();
const Mandi = require('./models/Mandi');
const PriceRecord = require('./models/PriceRecord');

const seedHistoricalData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const mandi = await Mandi.findOne({ isOpen: true });
        if (!mandi) {
            console.error('No mandi found.');
            process.exit(1);
        }

        const crop = 'wheat';

        // Delete old records for this crop to have clean test
        await PriceRecord.deleteMany({ crop });

        // Seed data for different days
        // Note: MongoDB $dayOfWeek: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat

        const records = [];
        const now = new Date();

        // We want to find a day that is NOT today and make it the "best" day.
        // Let's make "Wednesday" the best day.

        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dayNum = date.getDay() + 1; // getDay() is 0-6 (Sun-Sat), so +1

            let price = 2400; // default
            if (dayNum === 4) { // Wednesday
                price = 2800;
            } else if (dayNum === date.getDay() + 1 && date.toDateString() === now.toDateString()) {
                price = 2300; // Current day price low
            }

            records.push({
                mandiId: mandi._id,
                crop,
                price,
                timestamp: date
            });
        }

        await PriceRecord.insertMany(records);

        console.log(`Mock historical data seeded for crop: ${crop}`);
        console.log(`Higher prices set for Wednesdays (₹2800) vs others (₹2400).`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding historical data:', err);
        process.exit(1);
    }
};

seedHistoricalData();
