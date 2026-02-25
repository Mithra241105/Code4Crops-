# Krishi-Route 🌾

**Smart Agriculture Logistics Platform**

A comprehensive platform connecting Farmers and Mandis to maximize profit through real-time route optimization, live pricing, and seamless communication. 

---

## 🚀 Live Demo & Access

**Frontend Hosted Link:** [Insert Vercel/Netlify Link Here]  
**Backend Hosted Link:** [Insert Render/Heroku Link Here]  

### Test Credentials
To explore the application without signing up, you can use the following default test accounts:

**👨‍🌾 Farmer Account:**
- **Email:** `farmer1@krishiroute.com`
- **Password:** `123456`

**🏪 Mandi Operator Account:**
- **Email:** `mandi1@krishiroute.com`
- **Password:** `123456`

*(Note: There are `farmer1` to `farmer3` and `mandi1` to `mandi15` available with the same password).*

---

## 🎯 Core Workflow

1. **Authentication:** Users sign up/login as either a `Farmer` or a `Mandi Operator`. Email OTP verification secures the platform.
2. **Farmer Portal:** Farmers enter their crop type, current location (via GPS or manual input), and yield quantity. 
3. **Smart Optimization:** The backend calculates the *Net Profit* for nearby mandis using the formula:  
   `Net Profit = (Crop Price × Quantity) - Transport Cost - Handling Cost`  
   The platform recommends the best mandi based on real-time prices, distance, and historical demand.
4. **Mandi Portal:** Mandi operators manage their listed crop prices, update their availability (`Open`/`Closed`), and track local demand analytics.
5. **AI Assistance:** A built-in AI chatbot (powered by Grok/Ollama) assists users with farming queries, platform navigation, and multilingual support (English, Hindi, Tamil).

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Multi-Role Dashboards** | Distinct interfaces and features for Farmers and Mandi Operators. |
| **Real-time Profit Optimization** | Calculates transport & handling factors to find the most profitable market. |
| **Interactive Maps** | Integrated Leaflet Map (with Google Maps fallback) for route visualization and GPS tracking. |
| **Mandi Price Management (CMS)** | Mandi Admins can dynamically adjust crop prices and toggle active status. |
| **Multilingual Support** | i18n support localized in English, हिन्दी (Hindi), and தமிழ் (Tamil). |
| **AI Chat Assistant** | Floating widget utilizing context-aware AI for instant help and agricultural queries. |
| **Secure Authentication** | JWT-based auth with bcrypt password hashing and SMTP-powered OTP verification. |
| **Analytics & History** | Visual bar charts (using Recharts) for profit tracking and historical transaction data. |

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **Vite:** High-performance UI framework and build tool.
- **Material-UI (MUI):** Premium component library for modern, responsive, and accessible design.
- **React Router:** For seamless single-page application (SPA) routing.
- **i18next:** For robust internationalization and translation management.
- **Leaflet & React-Leaflet:** For interactive geospatial mapping.
- **Recharts:** For rendering analytics and profit visualization charts.

### Backend
- **Node.js** + **Express.js:** Fast, non-blocking REST API server.
- **MongoDB** + **Mongoose:** NoSQL database for flexible user, mandi, and transaction modeling.
- **JSON Web Tokens (JWT):** Stateless, secure API authentication.
- **Nodemailer:** For sending OTPs and password reset emails.
- **Express Rate Limit:** To protect against brute-force and DDoS attacks.
- **AI Integration:** Support for local Ollama execution and Grok API fallback for intelligent chat.

---

## ⚙️ Local Setup Guide

### 1. Database & Backend Configuration

```bash
cd backend
cp .env.example .env
npm install
```
Edit the `.env` file and provide your `MONGO_URI`. 
*(Optional: Add `SMTP_*` for email functionality and `GROK_API_KEY` for AI capability).*

**Start Server & Seed Data:**
```bash
node seed.js     # Seeds the initial 15 Indian mandis and test users
npm run dev      # Starts the backend API on http://localhost:5000
```

### 2. Frontend Configuration

```bash
cd frontend
cp .env.example .env
npm install
```
Edit the frontend `.env` to point to the backend:
`VITE_API_URL=http://localhost:5000/api`

**Start React App:**
```bash
npm run dev      # Starts the frontend on http://localhost:5173
```
