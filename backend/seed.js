require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Mandi = require('./models/Mandi');

const mandisData = [
    {
        name: 'Azadpur Mandi', mandiId: 'DL-AZP-001',
        location: { lat: 28.7204, lng: 77.1651, address: 'Azadpur', city: 'Delhi', district: 'North Delhi', state: 'Delhi' },
        cropPrices: { wheat: 2150, rice: 2400, onion: 1800, potato: 1200, tomato: 2000, maize: 1900 },
        supportedCrops: ['wheat', 'rice', 'onion', 'potato', 'tomato', 'maize'],
        handlingRate: 120, isOpen: true, demandScore: 92, avgDailyVolume: 5000,
        phone: '011-27213503', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Vashi APMC Mandi', mandiId: 'MH-VSH-001',
        location: { lat: 19.0771, lng: 72.9988, address: 'Sector 19A, Vashi', city: 'Navi Mumbai', district: 'Thane', state: 'Maharashtra' },
        cropPrices: { onion: 2200, tomato: 2500, potato: 1400, rice: 2600, wheat: 2100, brinjal: 1800 },
        supportedCrops: ['onion', 'tomato', 'potato', 'rice', 'wheat', 'brinjal'],
        handlingRate: 160, isOpen: true, demandScore: 88, avgDailyVolume: 8000,
        phone: '022-27663456', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Koyambedu Market', mandiId: 'TN-KYB-001',
        location: { lat: 13.0694, lng: 80.1948, address: 'Koyambedu', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu' },
        cropPrices: { rice: 2800, tomato: 2100, onion: 1900, banana: 3000, coconut: 2500, groundnut: 5000 },
        supportedCrops: ['rice', 'tomato', 'onion', 'banana', 'coconut', 'groundnut'],
        handlingRate: 140, isOpen: true, demandScore: 85, avgDailyVolume: 6000,
        phone: '044-24742154', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    {
        name: 'Yeshwanthpur APMC', mandiId: 'KA-YWP-001',
        location: { lat: 13.0198, lng: 77.5500, address: 'Yeshwanthpur', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka' },
        cropPrices: { tomato: 2300, potato: 1500, onion: 2000, rice: 2700, ragi: 2200, maize: 1850 },
        supportedCrops: ['tomato', 'potato', 'onion', 'rice', 'ragi', 'maize'],
        handlingRate: 150, isOpen: true, demandScore: 78, avgDailyVolume: 4500,
        phone: '080-23370101', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Kolkata Koley Market', mandiId: 'WB-KLY-001',
        location: { lat: 22.5726, lng: 88.3639, address: 'Koley Market, Sealdah', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
        cropPrices: { rice: 2500, potato: 1100, onion: 1700, jute: 3500, mustard: 4800 },
        supportedCrops: ['rice', 'potato', 'onion', 'jute', 'mustard'],
        handlingRate: 130, isOpen: true, demandScore: 80, avgDailyVolume: 5500,
        phone: '033-22366001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Lasalgaon Onion Market', mandiId: 'MH-LSG-001',
        location: { lat: 20.1254, lng: 74.0117, address: 'Lasalgaon', city: 'Nashik', district: 'Nashik', state: 'Maharashtra' },
        cropPrices: { onion: 2800, tomato: 1900, garlic: 6000, wheat: 2050 },
        supportedCrops: ['onion', 'tomato', 'garlic', 'wheat'],
        handlingRate: 110, isOpen: true, demandScore: 95, avgDailyVolume: 12000,
        phone: '02550-284245', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Khurda Road Grain Mandi', mandiId: 'OD-KRD-001',
        location: { lat: 20.1650, lng: 85.6090, address: 'Khurda', city: 'Bhubaneswar', district: 'Khurda', state: 'Odisha' },
        cropPrices: { rice: 2350, wheat: 2000, maize: 1750, groundnut: 4700 },
        supportedCrops: ['rice', 'wheat', 'maize', 'groundnut'],
        handlingRate: 100, isOpen: true, demandScore: 65, avgDailyVolume: 2000,
        phone: '0674-2340001', operatingDays: ['Mon', 'Wed', 'Fri'],
    },
    {
        name: 'Amritsar Grain Market', mandiId: 'PB-ASR-001',
        location: { lat: 31.6340, lng: 74.8723, address: 'Lawrence Road', city: 'Amritsar', district: 'Amritsar', state: 'Punjab' },
        cropPrices: { wheat: 2300, rice: 2100, maize: 1800, cotton: 6500, mustard: 5000 },
        supportedCrops: ['wheat', 'rice', 'maize', 'cotton', 'mustard'],
        handlingRate: 130, isOpen: true, demandScore: 82, avgDailyVolume: 7000,
        phone: '0183-2506001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Pune Market Yard', mandiId: 'MH-PNE-001',
        location: { lat: 18.5204, lng: 73.8567, address: 'Market Yard, Gultekdi', city: 'Pune', district: 'Pune', state: 'Maharashtra' },
        cropPrices: { onion: 2400, potato: 1350, tomato: 2200, wheat: 2080, soybean: 4200, grapes: 3800 },
        supportedCrops: ['onion', 'potato', 'tomato', 'wheat', 'soybean', 'grapes'],
        handlingRate: 155, isOpen: true, demandScore: 86, avgDailyVolume: 6500,
        phone: '020-24262323', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Indore Grain Market', mandiId: 'MP-IDR-001',
        location: { lat: 22.7196, lng: 75.8577, address: 'Chhawani Mandi', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh' },
        cropPrices: { soybean: 4400, wheat: 2200, maize: 1850, garlic: 5800, onion: 2050, cotton: 6200 },
        supportedCrops: ['soybean', 'wheat', 'maize', 'garlic', 'onion', 'cotton'],
        handlingRate: 125, isOpen: true, demandScore: 76, avgDailyVolume: 5000,
        phone: '0731-2700001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Sikar Vegetable Market', mandiId: 'RJ-SKR-001',
        location: { lat: 27.6094, lng: 75.1399, address: 'Sikar Road', city: 'Sikar', district: 'Sikar', state: 'Rajasthan' },
        cropPrices: { wheat: 2100, mustard: 4900, onion: 1750, guar: 4200, millet: 1950 },
        supportedCrops: ['wheat', 'mustard', 'onion', 'guar', 'millet'],
        handlingRate: 95, isOpen: true, demandScore: 58, avgDailyVolume: 1800,
        phone: '01572-270001', operatingDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    },
    {
        name: 'Hyderabad Vegetable Market', mandiId: 'TG-HYD-001',
        location: { lat: 17.3850, lng: 78.4867, address: 'Bowenpally', city: 'Hyderabad', district: 'Medchal', state: 'Telangana' },
        cropPrices: { tomato: 2400, onion: 2100, potato: 1300, rice: 2750, chilli: 7000, maize: 1900 },
        supportedCrops: ['tomato', 'onion', 'potato', 'rice', 'chilli', 'maize'],
        handlingRate: 145, isOpen: true, demandScore: 84, avgDailyVolume: 5800,
        phone: '040-27787001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    {
        name: 'Rajkot Cotton & Groundnut Market', mandiId: 'GJ-RJK-001',
        location: { lat: 22.3039, lng: 70.8022, address: 'Greenland Road', city: 'Rajkot', district: 'Rajkot', state: 'Gujarat' },
        cropPrices: { groundnut: 5200, cotton: 6800, wheat: 2020, castor: 5700, bajra: 1600 },
        supportedCrops: ['groundnut', 'cotton', 'wheat', 'castor', 'bajra'],
        handlingRate: 105, isOpen: true, demandScore: 73, avgDailyVolume: 4000,
        phone: '0281-2231001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Nagpur Orange Market', mandiId: 'MH-NGP-001',
        location: { lat: 21.1458, lng: 79.0882, address: 'Kalamna Market', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra' },
        cropPrices: { orange: 3500, wheat: 2060, soybean: 4100, cotton: 6100, tomato: 2150 },
        supportedCrops: ['orange', 'wheat', 'soybean', 'cotton', 'tomato'],
        handlingRate: 135, isOpen: true, demandScore: 71, avgDailyVolume: 3500,
        phone: '0712-2555001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    {
        name: 'Ludhiana Grain Mandi', mandiId: 'PB-LDH-001',
        location: { lat: 30.9010, lng: 75.8573, address: 'Grain Market', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab' },
        cropPrices: { wheat: 2280, rice: 2120, maize: 1820, potato: 1250, mustard: 4950 },
        supportedCrops: ['wheat', 'rice', 'maize', 'potato', 'mustard'],
        handlingRate: 125, isOpen: true, demandScore: 79, avgDailyVolume: 6000,
        phone: '0161-2770001', operatingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
];

/**
 * Idempotent seed: only runs if the database is empty.
 * Safe to call on every server start — won't destroy existing user data.
 */
const seed = async () => {
    try {
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log(`ℹ️  Seed skipped — ${existingUsers} user(s) already exist in database.`);
            return;
        }

        console.log('🌱 Empty database detected. Seeding default accounts...');
        const passwordHash = await bcrypt.hash('123456', 12);

        // 1. Create default farmers
        for (let i = 1; i <= 3; i++) {
            await User.create({
                name: `Farmer ${i}`,
                email: `farmer${i}@krishiroute.com`,
                passwordHash,
                role: 'farmer',
                isVerified: true,
                farmerProfile: {
                    village: 'Sample Village',
                    district: 'Sample District',
                    state: 'Maharashtra',
                    phone: `987654321${i}`,
                    farmSize: 5 + i,
                }
            });
        }
        console.log('🌾 Created 3 default farmers (farmer1-3@krishiroute.com)');

        // 2. Create mandi user accounts + linked Mandi documents
        for (let i = 0; i < mandisData.length; i++) {
            const idx = i + 1;
            const md = mandisData[i];

            const user = await User.create({
                name: `Mandi Operator ${idx}`,
                email: `mandi${idx}@krishiroute.com`,
                passwordHash,
                role: 'mandi',
                isVerified: true,
                mandiProfile: {
                    mandiName: md.name,
                    mandiId: md.mandiId,
                    location: md.location,
                    phone: md.phone,
                },
            });

            await Mandi.create({
                ...md,
                adminUser: user._id,          // ← link user to mandi
                cropPrices: new Map(Object.entries(md.cropPrices)),
            });
        }
        console.log(`🏪 Created ${mandisData.length} mandis with linked admin accounts (mandi1-15@krishiroute.com)`);
        console.log('\n🔑 Default password for ALL accounts: 123456');
        console.log('─────────────────────────────────────────────');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
    }
};

module.exports = seed;
