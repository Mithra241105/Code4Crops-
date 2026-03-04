const mongoose = require('mongoose');
require('dotenv').config();
const TravelPlan = require('./models/TravelPlan');
const Mandi = require('./models/Mandi');
const User = require('./models/User');

const seedPoolingData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a farmer and a mandi
        const farmer = await User.findOne({ role: 'farmer' });
        const mandi = await Mandi.findOne({ isOpen: true });

        if (!farmer || !mandi) {
            console.error('Farmer or Mandi not found. Please run the main seed script first.');
            process.exit(1);
        }

        const today = new Date().toISOString().split('T')[0];

        // Delete existing mock plan to keep it fresh
        await TravelPlan.deleteMany({ fuelPriceUsed: 999 }); // Using a high fuelPrice as a mock marker if needed, or just delete by date

        // Create a mock travel plan for another farmer
        // Note: we use current date as travelDate
        const mockPlan = await TravelPlan.create({
            farmerId: new mongoose.Types.ObjectId(),
            crop: 'wheat',
            quantity: 5,
            mandiId: mandi._id,
            vehicleType: 'miniTruck',
            travelDate: today,
            location: { lat: 18.5204, lng: 73.8567, name: 'Pune' }
        });

        console.log('Mock travel plan created successfully for:', today);
        console.log('Mandi Name:', mandi.name);
        console.log('Crop:', mockPlan.crop);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding pooling data:', err);
        process.exit(1);
    }
};

seedPoolingData();
