const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' });
        if (!['farmer', 'mandi'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const user = new User({ name, email: email.toLowerCase(), role });
        await user.setPassword(password);
        const otp = user.generateOTP();
        await user.save();

        await sendOTPEmail(email, otp, 'verification');
        res.status(201).json({ message: 'Account created. Please verify your email.', email: user.email });
    } catch (err) {
        console.error('/signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
        if (!user.verifyOTP(otp)) return res.status(400).json({ error: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ message: 'Email verified successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });

        const otp = user.generateOTP();
        await user.save();
        await sendOTPEmail(email, otp, 'verification');
        res.json({ message: 'OTP resent to your email' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        if (!(await user.checkPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
        if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email first', needsVerification: true, email: user.email });

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        user.langPref && null; // keep langPref
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, langPref: user.langPref } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        // Always respond success (security: don't reveal if email exists)
        if (!user || !user.isVerified) return res.json({ message: 'If the email exists, an OTP has been sent.' });

        const otp = user.generateOTP();
        await user.save();
        await sendOTPEmail(email, otp, 'reset');
        res.json({ message: 'If the email exists, an OTP has been sent.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields required' });
        if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.verifyOTP(otp)) return res.status(400).json({ error: 'Invalid or expired OTP' });

        await user.setPassword(newPassword);
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').requireAuth, async (req, res) => {
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, langPref: req.user.langPref } });
});

// POST /api/auth/change-password  (requires JWT)
router.post('/change-password', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await user.checkPassword(oldPassword);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

        await user.setPassword(newPassword);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('/change-password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
