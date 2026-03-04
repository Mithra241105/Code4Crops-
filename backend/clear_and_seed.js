const mongoose = require('mongoose');
const User = require('./models/User');
const Mandi = require('./models/Mandi');
const PriceRecord = require('./models/PriceRecord');
const seedDatabase = require('./seed');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const clearAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Temporarily commented out to force re-seed and clear orphans

        const mandiCount = await Mandi.countDocuments();
        if (mandiCount > 0) {
            console.log('✅ Mandi data already exists. Skipping seed to preserve current state.');
            process.exit(0);
        }


        const TravelPlan = require('./models/TravelPlan');
        const OptimizationHistory = require('./models/OptimizationHistory');

        console.log('🗑️ Clearing existing Mandi, User, PriceRecord, TravelPlan, and History data...');
        await Mandi.deleteMany({});
        // Clean up any users with mandi emails or role
        await User.deleteMany({
            $or: [
                { role: 'mandi' },
                { email: { $regex: /mandi_.*@krishiroute.com/i } }
            ]
        });
        await PriceRecord.deleteMany({});
        await TravelPlan.deleteMany({});
        await OptimizationHistory.deleteMany({});

        console.log('✅ Data cleared. Starting seed...');
        await seedDatabase();
        console.log('🚀 Seed successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during clear and seed:', err);
        process.exit(1);
    }
};

clearAndSeed();
