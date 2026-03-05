# Krishi-Route 🌾
### *Smart Agricultural Logistics & Profit Optimization*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)](https://www.mongodb.com/)
[![MUI](https://img.shields.io/badge/UI-Material%20UI%20v5-blueviolet)](https://mui.com/)

**Krishi-Route** is a premium, state-of-the-art web application designed to empower farmers by optimizing their crop sales. It combines real-time market data, interactive geospatial mapping, and advanced logistics algorithms to find the most profitable Mandis (markets) for their produce.

🔗 **[Live Demo](https://code4-crops.vercel.app/)** | 📺 **[Project Overview Video](https://drive.google.com/drive/folders/1EmfPVGZyaL5DB-3kiu4QlOdJdbFpa2kX?usp=sharing)**

---

## 🌟 Project Overview
In many agricultural sectors, farmers often lose significant profit due to opaque pricing and high transport costs. **Krishi-Route** solves this by:
1.  **Analyzing live prices** across multiple Mandis.
2.  **Calculating real-time transport costs** based on distance and fuel prices.
3.  **Providing actionable insights** using historical trends and machine learning patterns.

---

## 🚀 Access & Test Credentials

Explore the platform without signing up using these default test accounts. All accounts use the same password.

**Password for all:** `123456`

### 👨‍🌾 Farmer Accounts
*Visualize the "Optimize" dashboard and match with Mandis.*
- `farmer1@krishiroute.com` to `farmer10@krishiroute.com`

### 🏪 Mandi Operator Accounts (By Region)
*Manage crop prices and view analytics for specific states.*
- **Tamil Nadu**: `mandi_tn1@krishiroute.com` to `mandi_tn5@krishiroute.com`
- **Kerala**: `mandi_kl1@krishiroute.com` to `mandi_kl5@krishiroute.com`
- **Andhra Pradesh**: `mandi_ap1@krishiroute.com` to `mandi_ap5@krishiroute.com`
- **Karnataka**: `mandi_ka1@krishiroute.com` to `mandi_ka5@krishiroute.com`
- **Maharashtra**: `mandi_mh1@krishiroute.com` to `mandi_mh5@krishiroute.com`
- **Punjab**: `mandi_pb1@krishiroute.com` to `mandi_pb5@krishiroute.com`

*(Format: `mandi_[state_code][1-5]@krishiroute.com` — Works for all 28 states!)*

---

## 🎨 Professional UI & UX Design
The application is built with a **Premium Focus**, ensuring a "wow" factor for every user.

### State-of-the-Art Aesthetics
- **Material UI (MUI) v5**: Full utilization of MUI's design tokens for a sleek, modern, and accessible interface.
- **Glassmorphism & Depth**: Subtle shadows, semi-transparent layers, and blurred backgrounds create a high-end feel.
- **Micro-Animations**: Smooth transitions and hover effects (using CSS and Framer-inspired logic) keep the interface feeling alive.
- **No Placeholders**: Every image and icon is carefully curated using dynamic icons from `@mui/icons-material`.

### Hardware & GPU Optimization
- **GPU-Accelerated Maps**: Interactive maps (built with **Leaflet**) utilize hardware acceleration for ultra-smooth panning and zooming.
- **Performant Charting**: **Chart.js** and **Recharts** are optimized to render complex profit and demand data without taxing the CPU.

### Comprehensive Themes
- **Dynamic Theming**: Features a built-in `ThemeContext` allowing users to switch between **Dark Mode** and **Light Mode** instantly.
- **Adaptive UI**: The entire layout recalibrates its color palette and contrast based on the selected theme.

---

## 🌍 Multilingual Support (13 Languages)
To bridge the gap for regional farmers, **Krishi-Route** supports **13 different languages** using `react-i18next`.

| Supported Languages | | | |
|---|---|---|---|
| English | हिन्दी (Hindi) | தமிழ் (Tamil) | తెలుగు (Telugu) |
| বাংলা (Bengali) | മലയാളം (Malayalam) | ಕನ್ನಡ (Kannada) | ગુજરાતી (Gujarati) |
| मराठी (Marathi) | اردو (Urdu) | ਪੰਜਾਬੀ (Punjabi) | ଓଡ଼ିଆ (Odia) |
| অসমীয়া (Assamese) | | | |

*The application handles Right-to-Left (RTL) for Urdu as well.*

---

## 🧠 How It Works (The Brain)
The "Brain" of the project is the **Optimization Engine**, a multi-layered logic system.

### 1. The Profit Maximization Formula
The system recommends Mandis based on a weighted **Net Profit** calculation:
> **Net Profit** = (Current Price × Yield) - (Distance × Fuel Cost/KM) - Handling Fees

### 2. Historical Insights & AI Patterns
- **Average Tuesday Price**: A trend-based analysis to suggest the optimal day to sell.
- **Arrival Pressure**: Monitors Mandi inventory levels to predict imminent price drops.
- **Volatility Scores**: Helps farmers avoid markets with unstable price fluctuations.

### 3. Rural Transport Pooling
A unique feature that allows farmers to share transport costs. The system automatically finds other farmers heading to the same Mandi on the same date, drastically reducing overhead and increasing net profit.

---

## 💾 Permanent Seed Data System
Unlike traditional apps that reset data on every restart, **Krishi-Route** features an **Intelligent Seeding Engine**.

- **One-Time Initialization**: Seed data is created only once on the first run.
- **Permanence**: Data is stored permanently in MongoDB. The system detects existing records and skips the seeding process on subsequent startups.
- **Regional Accuracy**: Seeded data includes realistic Mandis from Tamil Nadu, Kerala, and Andhra Pradesh, with localized farmer profiles.

---

## 🛠️ Technology Stack

### Frontend
- **React (+ Vite)**: For ultra-fast development and optimized production bundles.
- **Material UI**: The core design system for premium feel.
- **React-Leaflet**: GPU-accelerated geospatial mapping.
- **Chart.js / Recharts**: High-performance data visualization.

### Backend
- **Node.js & Express**: A robust, non-blocking API layer.
- **MongoDB (Mongoose)**: Scalable NoSQL database with optimized indexing.
- **JWT & Bcrypt**: Enterprise-grade security for authentication.
- **Nodemailer**: Secure OTP and transaction notifications.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### 🚀 Unique Automated Launch (Recommended)
Krishi-Route features a custom automated setup system that handles everything for you.

**For Linux/Mac/Git Bash:**
```bash
chmod +x start.bash
./start.bash
```

**For Windows (Command Prompt):**
```powershell
.\start.bat
```

**What this does automatically:**
1.  **Installs** all dependencies for both Backend and Frontend.
2.  **Initializes** the Permanent Seed Data.
3.  **Launches** both servers in parallel in a single terminal window.

---

## 🛡️ Security Features
- **OTP Verification**: Secure login via email and mobile.
- **Route Guards**: Protected dashboards for Farmers and Mandi Admins.
- **Environment Protection**: Sensitive keys are managed via `.env` files.

---

*Made with ❤️ for the farming community.*
