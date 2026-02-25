const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'mandi'], required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    langPref: { type: String, default: 'en', enum: ['en', 'hi', 'ta'] },

    // Farmer-specific profile
    farmerProfile: {
        village: String,
        district: String,
        state: String,
        phone: String,
        farmSize: Number, // in acres
        preferredCrops: [String],
        preferredVehicle: String,
    },

    // Mandi-specific profile
    mandiProfile: {
        mandiName: String,
        mandiId: String,
        location: {
            lat: Number,
            lng: Number,
            address: String,
            city: String,
            state: String,
        },
        phone: String,
        licenseNumber: String,
        isActive: { type: Boolean, default: true },
    },
}, { timestamps: true });

// Hash password
userSchema.methods.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 12);
};

// Verify password
userSchema.methods.checkPassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (otp) {
    if (!this.otp || !this.otpExpiry) return false;
    if (new Date() > this.otpExpiry) return false;
    return this.otp === otp;
};

module.exports = mongoose.model('User', userSchema);
