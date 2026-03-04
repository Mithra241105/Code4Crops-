const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Mandi = require('./models/Mandi');
const TravelPlan = require('./models/TravelPlan');
const PriceRecord = require('./models/PriceRecord');
require('dotenv').config();

// 🌾 MASTER CROP LIST
const MASTER_CROPS = [
    'wheat', 'rice', 'maize', 'onion', 'potato', 'tomato', 'cotton',
    'soybean', 'mustard', 'groundnut', 'garlic', 'chilli', 'banana',
    'orange', 'millet', 'ragi', 'grapes', 'bajra', 'brinjal', 'jute', 'coconut'
];

// 💰 PRICE RANGES (Per Quintal)
const PRICE_RANGES = {
    wheat: [2400, 3200], rice: [2600, 3500], maize: [2000, 2800],
    onion: [1800, 2500], potato: [1500, 2300], tomato: [2000, 3000],
    cotton: [6500, 8000], soybean: [4000, 5500], mustard: [5000, 6500],
    groundnut: [4800, 6200], garlic: [9000, 14000], chilli: [15000, 20000],
    banana: [2800, 4500], orange: [3500, 5000], millet: [2200, 3000],
    ragi: [2000, 2800], grapes: [5000, 9000], bajra: [2200, 3000],
    brinjal: [1800, 2600], jute: [4000, 6000], coconut: [2500, 3800]
};

// 🗺️ 28 INDIAN STATES METADATA
const STATES = [
    { name: 'Andhra Pradesh', code: 'ap', lat: 15.9129, lng: 79.7400 },
    { name: 'Arunachal Pradesh', code: 'ar', lat: 28.2180, lng: 94.7278 },
    { name: 'Assam', code: 'as', lat: 26.2006, lng: 92.9376 },
    { name: 'Bihar', code: 'br', lat: 25.0961, lng: 85.3131 },
    { name: 'Chhattisgarh', code: 'cg', lat: 21.2787, lng: 81.8661 },
    { name: 'Goa', code: 'ga', lat: 15.2993, lng: 74.1240 },
    { name: 'Gujarat', code: 'gj', lat: 22.2587, lng: 71.1924 },
    { name: 'Haryana', code: 'hr', lat: 29.0588, lng: 76.0856 },
    { name: 'Himachal Pradesh', code: 'hp', lat: 31.1048, lng: 77.1734 },
    { name: 'Jharkhand', code: 'jh', lat: 23.6102, lng: 85.2799 },
    { name: 'Karnataka', code: 'ka', lat: 15.3173, lng: 75.7139 },
    { name: 'Kerala', code: 'kl', lat: 10.8505, lng: 76.2711 },
    { name: 'Madhya Pradesh', code: 'mp', lat: 22.9734, lng: 78.6569 },
    { name: 'Maharashtra', code: 'mh', lat: 19.7515, lng: 75.7139 },
    { name: 'Manipur', code: 'mn', lat: 24.6637, lng: 93.9063 },
    { name: 'Meghalaya', code: 'ml', lat: 25.4670, lng: 91.3662 },
    { name: 'Mizoram', code: 'mz', lat: 23.1645, lng: 92.9376 },
    { name: 'Nagaland', code: 'nl', lat: 26.1584, lng: 94.5624 },
    { name: 'Odisha', code: 'or', lat: 20.9517, lng: 85.0985 },
    { name: 'Punjab', code: 'pb', lat: 31.1471, lng: 75.3412 },
    { name: 'Rajasthan', code: 'rj', lat: 27.0238, lng: 74.2179 },
    { name: 'Sikkim', code: 'sk', lat: 27.5330, lng: 88.5122 },
    { name: 'Tamil Nadu', code: 'tn', lat: 11.1271, lng: 78.6569 },
    { name: 'Telangana', code: 'tg', lat: 18.1124, lng: 79.0193 },
    { name: 'Tripura', code: 'tr', lat: 23.9408, lng: 91.9882 },
    { name: 'Uttar Pradesh', code: 'up', lat: 26.8467, lng: 80.9462 },
    { name: 'Uttarakhand', code: 'uk', lat: 30.0668, lng: 79.0193 },
    { name: 'West Bengal', code: 'wb', lat: 22.9868, lng: 87.8550 }
];

// 🛠️ HELPER FUNCTIONS

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Generate a crop mix for a state's 5 mandis ensuring full coverage.
 */
const generateStateCropMix = () => {
    const stateMandisCrops = [[], [], [], [], []];
    const highDemand = ['rice', 'onion', 'tomato', 'banana'];
    const rareCrops = ['jute', 'mustard', 'soybean', 'bajra'];

    // Rule: Every crop must exist in at least 3 mandis per state
    MASTER_CROPS.forEach(crop => {
        const count = 3;
        const indices = shuffleArray([0, 1, 2, 3, 4]).slice(0, count);
        indices.forEach(idx => stateMandisCrops[idx].push(crop));
    });

    // Trim while preserving state-wide coverage
    // If a crop only exists in 1 mandi in this state, don't remove it from that mandi.
    stateMandisCrops.forEach((mandiCrops, idx) => {
        if (mandiCrops.length > 12) {
            // Find crops in this mandi that appear in at least one OTHER mandi in the state
            const candidatesToRemove = mandiCrops.filter(crop => {
                const otherMandisWithCrop = stateMandisCrops.filter((other, i) => i !== idx && other.includes(crop));
                return otherMandisWithCrop.length > 0;
            });

            const toRemoveCount = mandiCrops.length - 12;
            const removed = shuffleArray(candidatesToRemove).slice(0, toRemoveCount);
            stateMandisCrops[idx] = mandiCrops.filter(c => !removed.includes(c));
        }
    });

    return stateMandisCrops;
};

const generatePrices = (crops) => {
    const prices = {};
    const stateVar = 1 + (Math.random() * 0.1 - 0.05);

    crops.forEach(crop => {
        const [min, max] = PRICE_RANGES[crop];
        const base = getRandom(min, max);
        prices[crop] = Math.round(base * stateVar);
    });
    return prices;
};

// 🚀 CORE SEED ENGINE

const seedDatabase = async () => {
    try {
        console.log('🌱 Checking Database for existing data...');

        // 2. Generate Farmers
        const userCount = await User.countDocuments();
        console.log('👨🌾 Generating 10 farmers...');
        const farmers = [];
        if (userCount === 0) {
            for (let i = 1; i <= 10; i++) {
                const hashedPassword = await bcrypt.hash('123456', 12);
                farmers.push({
                    name: `Farmer ${i}`,
                    email: `farmer${i}@krishiroute.com`,
                    passwordHash: hashedPassword,
                    role: 'farmer',
                    isVerified: true,
                    farmerProfile: {
                        phone: `900000000${i - 1}`,
                        preferredCrops: ['wheat', 'rice']
                    }
                });
            }
            await User.insertMany(farmers);
        } else {
            console.log('✅ Farmers already exist. Skipping farmer seed.');
        }

        // 3. Generate Mandis per State
        console.log('🏪 Generating 140 mandis (28 states × 5 mandis)...');

        for (const state of STATES) {
            const stateCropMix = generateStateCropMix();

            for (let i = 1; i <= 5; i++) {
                const mandiId = `mandi_${state.code}${i}`;
                const email = `${mandiId}@krishiroute.com`;
                const crops = stateCropMix[i - 1];
                const cropPrices = {};
                for (const crop of crops) {
                    cropPrices[crop] = generatePrices([crop])[crop];
                }

                const mandiHashedPassword = await bcrypt.hash('123456', 12);

                // Ensure clean state for this specific user to avoid E11000
                await User.deleteMany({ email: email });

                // Ensure clean state for this specific mandi to avoid E11000
                await Mandi.deleteMany({ mandiId: mandiId });

                // Create User First (to get _id)
                const user = await User.create({
                    name: `${state.name} Mandi ${i}`,
                    email: email,
                    passwordHash: mandiHashedPassword,
                    role: 'mandi',
                    isVerified: true,
                    mandiProfile: {
                        mandiName: `${state.name} Mandi ${i}`,
                        mandiId: mandiId,
                        phone: `98000000${i}`,
                        location: {
                            lat: state.lat + (Math.random() * 0.4 - 0.2),
                            lng: state.lng + (Math.random() * 0.4 - 0.2),
                            state: state.name,
                            city: `City ${i}`
                        }
                    }
                });

                // Create Mandi Linked to User
                const createdMandi = await Mandi.create({
                    mandiId: mandiId,
                    name: `${state.name} Mandi ${i}`,
                    adminUser: user._id,
                    location: {
                        lat: state.lat + (Math.random() * 0.4 - 0.2),
                        lng: state.lng + (Math.random() * 0.4 - 0.2),
                        address: `Market Yard ${i}, ${state.name}`,
                        city: state.name === 'Andhra Pradesh' ? 'Amaravati' : `City ${i}`,
                        district: `District ${i}`,
                        state: state.name
                    },
                    supportedCrops: crops,
                    cropPrices: cropPrices,
                    handlingRate: getRandom(80, 180), // More competitive range
                    demandScore: getRandom(65, 95),
                    avgDailyVolume: getRandom(5000, 25000), // Higher volume
                    phone: `+91 98000 0000${i}`,
                    verified: true,
                    isOpen: true
                });

                // Seed priceHistory (7 historical snapshots per crop for better trends)
                const priceHistoryMap = new Map();
                for (const crop of crops) {
                    const currentPrice = cropPrices[crop];
                    if (currentPrice) {
                        const history = [currentPrice];
                        let lastPrice = currentPrice;
                        for (let h = 0; h < 6; h++) {
                            lastPrice = Math.round(lastPrice * (1 + (Math.random() * 0.08 - 0.04))); // ±4%
                            history.push(lastPrice);
                        }
                        priceHistoryMap.set(crop, history);

                        // Also seed PriceRecord for deeper analytics
                        await PriceRecord.create({
                            mandiId: createdMandi._id,
                            crop,
                            price: currentPrice,
                            createdAt: new Date()
                        });
                    }
                }
                createdMandi.priceHistory = priceHistoryMap;
                await createdMandi.save();
            }
            process.stdout.write('.'); // Progress dot
        }

        // 📊 FINAL VALIDATION & OUTPUT
        const finalMandis = await Mandi.find({});
        const finalUsers = await User.find({});

        console.log('\n\n✅ SEEDING COMPLETE');
        console.log('---------------------------');
        console.log(`Total Farmers: 10`);
        console.log(`Total Mandis:  ${finalMandis.length}`);
        console.log(`Total Users:   ${finalUsers.length}`);
        console.log('---------------------------');

        // State-wise Coverage Check
        let statesWithIssues = 0;
        console.log('Reviewing State-wise Crop Coverage...');
        for (const state of STATES) {
            const stateMandis = finalMandis.filter(m => m.location.state === state.name);
            const coveredCrops = new Set();
            stateMandis.forEach(m => m.supportedCrops.forEach(c => coveredCrops.add(c)));

            const missing = MASTER_CROPS.filter(c => !coveredCrops.has(c));
            if (missing.length > 0) {
                console.error(`❌ ${state.name}: Missing ${missing.join(', ')}`);
                statesWithIssues++;
            }
        }

        console.log(`\nValidation Result: ${statesWithIssues === 0 ? '🏆 100% PERFECT COVERAGE' : `⚠️ ${statesWithIssues} states have missing crops.`}`);

        // Only exit if this is the main module
        if (require.main === module) {
            process.exit(0);
        }
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
        if (require.main === module) {
            process.exit(1);
        }
        throw err;
    }
};

module.exports = seedDatabase;

// Connect and Seed only if executed directly
if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => seedDatabase())
        .catch(err => {
            console.error('MongoDB Connection Error:', err);
            process.exit(1);
        });
}
