const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://code4-crops.vercel.app",
      "https://code4-crops-l4li6.vercel.app",
      "http://localhost:5173",
      process.env.CLIENT_URL
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Root landing page
app.get('/', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0fdf4;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <h1 style="color: #16a34a; margin-top: 0;">🌾 Krishi-Route API</h1>
        <p style="color: #4b5563;">The brain of your agriculture platform is active!</p>
        <p style="font-size: 0.8rem; color: #9ca3af;">Status: <span style="color: #22c55e;">● Live</span></p>
      </div>
    </body>
  `);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

// MongoDB Connection — auto-seed after connect
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/krishiroute')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Run idempotent seed (no-op if data already exists)
    const seed = require('./seed');
    await seed();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/farmer', require('./routes/farmer'));
app.use('/api/mandi', require('./routes/mandi'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Krishi-Route API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
