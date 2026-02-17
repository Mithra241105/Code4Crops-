# Krishi-Route Frontend (Material UI)

Modern React frontend for the Krishi-Route profit and logistics optimizer, built with Material UI.

## 🎨 Tech Stack

- **React** (Vite)
- **Material UI** (@mui/material)
- **Emotion** (CSS-in-JS)
- **Axios** (HTTP client)
- **Recharts** (Charts)
- **Leaflet** (Maps)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero.jsx              # Landing section (MUI)
│   │   ├── InputForm.jsx         # Form with TextField & Select
│   │   ├── MandiCard.jsx         # Result cards with highlighting
│   │   ├── ProfitChart.jsx       # Recharts bar chart
│   │   ├── MapView.jsx           # Leaflet map
│   │   └── ResultsSection.jsx    # Results orchestration
│   ├── services/
│   │   └── api.js                # Axios API service
│   ├── theme.js                  # MUI theme configuration
│   ├── App.jsx                   # Main app with ThemeProvider
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open browser to `http://localhost:5174` (or shown URL)

### Build

```bash
npm run build
```

## 🎨 Theme

Custom Material UI theme with agriculture colors:

- **Primary:** `#2E7D32` (Green)
- **Background:** `#f4fdf4` (Light green tint)
- **Border Radius:** 12px
- **Font:** Roboto

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

### Backend API

Expects endpoints:
- `GET /mandis` - Fetch all mandis
- `POST /optimize` - Optimize route
  - Body: `{ quantity: number, vehicleType: string }`

## 🎯 Features

- ✅ Material UI AppBar with title
- ✅ Agriculture-themed design (#2E7D32 green)
- ✅ Card-based layout
- ✅ TextField & Select form controls
- ✅ Profit comparison chart (Recharts)
- ✅ Interactive map (Leaflet)
- ✅ Top mandi highlighting (green border + background)
- ✅ Profit difference alert
- ✅ Responsive Grid layout
- ✅ Loading states & error handling

## 📱 Responsive Design

MUI Grid breakpoints:
- **xs** (mobile): Single column
- **md** (tablet): 2 columns
- **lg** (desktop): 3 columns for cards, 2 for chart/map

## 🎨 Components

### AppBar
Green header with "Krishi-Route – Optimize Profit, Not Just Distance"

### Hero
Gradient background with feature cards and icons

### InputForm
- TextField for quantity input
- Select dropdown for vehicle type
- Button with loading indicator

### MandiCard
- Highlighted top choice (green border, background, "Best Choice" chip)
- Metrics: price, revenue, costs, net profit
- Hover effects

### ProfitChart
Bar chart with color-coded profits (green for top)

### MapView
Leaflet map with markers (green for recommended, red for others)

## 📦 Dependencies

```json
{
  "@mui/material": "^6.x",
  "@mui/icons-material": "^6.x",
  "@emotion/react": "^11.x",
  "@emotion/styled": "^11.x",
  "axios": "^1.x",
  "recharts": "^2.x",
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x"
}
```

## 🔗 Backend Connection

Ensure backend is running on `http://localhost:5000`

## 📝 Usage

1. Enter quantity in kg
2. Select vehicle type
3. Click "Optimize Route"
4. View ranked results with:
   - Top profitable mandi highlighted
   - Profit comparison chart
   - Interactive map
   - Profit difference vs nearest mandi

## 🎉 Migration from Tailwind

This project was migrated from Tailwind CSS to Material UI. All Tailwind classes have been replaced with MUI components and the `sx` prop.
