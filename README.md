# Krishi-Route 🌾
### *Smart Agricultural Logistics & Profit Optimization*

**Krishi-Route** is a premium, state-of-the-art web application designed to empower farmers by optimizing their crop sales. It combines real-time market data, interactive geospatial mapping, and advanced logistics algorithms to find the most profitable Mandis (markets) for their produce.

---

## 🌟 Project Overview
In many agricultural sectors, farmers often lose significant profit due to opaque pricing and high transport costs. **Krishi-Route** solves this by:
1.  **Analyzing live prices** across multiple Mandis.
2.  **Calculating real-time transport costs** based on distance and fuel prices.
3.  **Providing actionable insights** using historical trends and machine learning patterns.

---

## 🚀 Access & Test Credentials

You can explore the platform without signing up by using the following default test accounts. All accounts use the same password.

**Password for all:** `123456`

### 👨‍🌾 Farmer Accounts
Use these to see the "Optimize” dashboard and find matching Mandis.
-   `farmer1@krishiroute.com` to `farmer10@krishiroute.com`

### 🏪 Mandi Operator Accounts (By Region)
Use these to manage crop prices and view analytics for specific states.
-   **Tamil Nadu**: `mandi_tn1@krishiroute.com` to `mandi_tn5@krishiroute.com`
-   **Kerala**: `mandi_kl1@krishiroute.com` to `mandi_kl5@krishiroute.com`
-   **Andhra Pradesh**: `mandi_ap1@krishiroute.com` to `mandi_ap5@krishiroute.com`
-   **Karnataka**: `mandi_ka1@krishiroute.com` to `mandi_ka5@krishiroute.com`
-   **Maharashtra**: `mandi_mh1@krishiroute.com` to `mandi_mh5@krishiroute.com`
-   **Punjab**: `mandi_pb1@krishiroute.com` to `mandi_pb5@krishiroute.com`

*(Format: `mandi_[state_code][1-5]@krishiroute.com` — Works for all 28 states!)*

---

## 🎨 Professional UI & UX Design
The application is built with a **Premium Focus**, ensuring a "wow" factor for every user.

### State-of-the-Art Aesthetics
-   **Material UI (MUI) v5**: We use the full power of MUI for a sleek, modern, and accessible interface.
-   **Glassmorphism & Depth**: Subtle shadows, semi-transparent layers, and blurred backgrounds create a high-end feel.
-   **Micro-Animations**: Smooth transitions and hover effects (using CSS and Framer-like approaches) keep the interface feeling alive and responsive.
-   **No Placeholders**: Every image and icon is carefully curated—we use dynamic icons from `@mui/icons-material` and high-quality generated assets.

### Hardware & GPU Optimization
-   **GPU-Accelerated Maps**: The interactive maps (built with **Leaflet**) utilize hardware acceleration for ultra-smooth panning and zooming.
-   **Performant Charting**: **Chart.js** and **Recharts** are optimized to render complex profit and demand data without taxing the CPU.

### Comprehensive Themes
-   **Dynamic Theming**: Features a built-in `ThemeContext` allowing users to switch between **Dark Mode** and **Light Mode** instantly.
-   **Adaptive UI**: The entire layout recalibrates its color palette and contrast based on the selected theme, ensuring eye comfort during any time of the day.

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

## 🧠 How It Works (The Core Logic)
The "Brain" of the project is the **Optimization Engine**.

### The Profit Formula
The system recommends Mandis based on the **Net Profit** formula:
> **Net Profit** = (Current Price × Yield) - (Distance × Fuel Cost/KM) - Handling Fees

### Historical Insights
-   Calculates the **Average Tuesday Price** trend to suggest the best day to sell.
-   Monitors **Arrival Pressure** at Mandis to predict price drops.
-   Provides **Volatility Scores** to help farmers avoid unstable markets.

---

## 💾 Permanent Seed Data System
Unlike traditional apps that reset data on every restart, **Krishi-Route** features an **Intelligent Seeding Engine**.

-   **One-Time Initialization**: Seed data is created only once on the first run.
-   **Permanence**: Data is stored permanently in MongoDB. The system detects existing records and skips the seeding process on subsequent startups, preserving all user-generated data.
-   **Regional Accuracy**: Seeded data includes realistic Mandis from Tamil Nadu, Kerala, and Andhra Pradesh, with localized farmer profiles.

---

## 🛠️ Technology Stack

### Frontend
-   **React (+ Vite)**: For ultra-fast development and optimized production bundles.
-   **Material UI**: The core design system.
-   **React-Leaflet**: GPU-accelerated geospatial mapping.
-   **Chart.js / Recharts**: Data visualization.

### Backend
-   **Node.js & Express**: A robust, non-blocking API layer.
-   **MongoDB (Mongoose)**: Scalable NoSQL database.
-   **JWT & Bcrypt**: Enterprise-grade security for authentication.
-   **Nodemailer**: Secure OTP and transaction notifications.

---

## 🚀 Getting Started

### 1. Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or on Atlas)

### 🚀 Unique Automated Launch (Recommended)
Krishi-Route features a custom automated setup system that handles everything for you. This is the **fastest and most unique way** to get the project running.

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

### 4. Manual Start (If preferred)
**Backend:**
```bash
cd backend
npm install
node seed.js  # Runs only if DB is empty
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Security Features
-   **OTP Verification**: Secure login via email and mobile.
-   **Route Guards**: Protected dashboards for Farmers and Mandi Admins.
-   **Environment Protection**: Sensitive keys are managed via `.env` files.

---

*Made with ❤️ for the farming community.*
