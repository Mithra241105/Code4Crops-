const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const mandiSchema = new mongoose.Schema({
    name: String,
    distance: Number,
    price: Number,
    latitude: Number,
    longitude: Number
});

const Mandi = mongoose.model("Mandi", mandiSchema);

app.get("/mandis", async (req, res) => {
    const mandis = await Mandi.find();
    res.json(mandis);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post("/optimize", async (req, res) => {
    try {
        const { quantity, vehicleType } = req.body;

        if (!quantity || !vehicleType) {
            return res.status(400).json({ error: "Quantity and vehicleType required" });
        }

        // Vehicle rates per km
        const vehicleRates = {
            bike: 4,
            auto: 8,
            miniTruck: 18,
            tractor: 14
        };

        const vehicleRate = vehicleRates[vehicleType];

        const mandis = await Mandi.find();

        const results = mandis.map(mandi => {
            const revenue = mandi.price * quantity;
            const transportCost = mandi.distance * vehicleRate;
            const handlingCost = quantity * 1.5; // flat ₹1.5 per kg
            const netProfit = revenue - transportCost - handlingCost;

            return {
                name: mandi.name,
                distance: mandi.distance,
                price: mandi.price,
                revenue,
                transportCost,
                handlingCost,
                netProfit
            };
        });

        // Sort by highest profit
        results.sort((a, b) => b.netProfit - a.netProfit);

        res.json(results);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

