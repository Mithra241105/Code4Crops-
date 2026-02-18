# 🌾 Krishi-Route - Smart Agriculture Platform

Hi! This is **Krishi-Route**, a project I built to help farmers make more money by choosing the right market (Mandi) to sell their crops. 

Usually, farmers go to the closest market, but sometimes a market a bit further away gives a much better price. This app calculates the **Net Profit** (Revenue - Transport Cost - Handling Cost) so they can see which option is actually the best!

## ✨ What this app does:
- **Profit Calculator:** Enter your crop, weight, and vehicle to see how much you'll actually keep after costs.
- **Smart Rankings:** Mandis are ranked with badges (Gold, Silver, Bronze) based on total profit.
- **Visual Analytics:** See your potential revenue vs transport expenses in clean charts.
- **Interactive Map:** Shows you exactly where the best mandis are with route lines.
- **Farmer Profile:** Remembers your name and location so you don't have to type it every time.
- **Optimization History:** Keeps track of your past searches so you can compare.

## 🛠️ Tech Stack:
- **Frontend:** React.js + Vite (it's super fast!)
- **Styling:** Material UI (MUI) for a clean, professional look.
- **Charts:** Recharts for the cool graphs.
- **Maps:** Leaflet.js for the interactive maps.
- **Backend:** Node.js & Express.
- **Database:** MongoDB (using Atlas).

## 🚀 How to run it on your computer:

### 1. Backend Setup
1. Go into the `backend` folder.
2. Run `npm install` to get the dependencies.
3. Create a `.env` file and add your `MONGO_URI`.
4. Start the server with `node server.js`.

### 2. Frontend Setup
1. Go into the `frontend` folder.
2. Run `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:5173` in your browser.

## 🌍 Deployment
- **Frontend** is hosted on **Vercel**.
- **Backend** is hosted on **Render**.
- https://code4-crops-8yvc-1cgee4dpq-mithra-ss-projects.vercel.app/

---
*Created by the Code4Crops Hackathon Team! Hope this helps our farmers grow more profit!* 🚜📈
