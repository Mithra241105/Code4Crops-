const { getFuelPrice, calculateTransportCost, getVehicleCapacity, VEHICLE_EFFICIENCY, VEHICLE_BASE_RATE } = require('./fuelService');

// Perishable crops and their km risk thresholds
const PERISHABLE_CROPS = {
    tomato: { medium: 100, high: 200 },
    potato: { medium: 200, high: 400 },
    onion: { medium: 250, high: 500 },
    banana: { medium: 80, high: 150 },
    grapes: { medium: 120, high: 250 },
    orange: { medium: 150, high: 300 },
    brinjal: { medium: 80, high: 150 },
    garlic: { medium: 200, high: 400 },
    chilli: { medium: 150, high: 300 },
};

const getPerishabilityRisk = (cropType, distanceKm) => {
    const thresholds = PERISHABLE_CROPS[cropType];
    if (!thresholds) return null;  // non-perishable
    if (distanceKm >= thresholds.high) return 'high';
    if (distanceKm >= thresholds.medium) return 'medium';
    return 'low';
};

/**
 * Haversine distance between two lat/lng points (km)
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Calculate profit optimization across all mandis
 * @param {Object} params - { farmerLat, farmerLng, cropType, quantity (quintals), vehicleType, state, poolingMatches }
 * @param {Array} mandis - Array of Mandi documents
 */
const optimizeProfits = (params, mandis) => {
    const { farmerLat, farmerLng, cropType, quantity, vehicleType, state = 'default', poolingMatches = [] } = params;
    const fuelPrice = getFuelPrice(state);

    const results = mandis
        .filter(mandi => mandi.isOpen && mandi.location && mandi.location.lat && mandi.location.lng)
        .filter(mandi => {
            const price = mandi.cropPrices.get ? mandi.cropPrices.get(cropType) : mandi.cropPrices[cropType];
            return price && price > 0;
        })
        .map(mandi => {
            const distance = haversineDistance(farmerLat, farmerLng, mandi.location.lat, mandi.location.lng);
            const cropPrice = mandi.cropPrices.get ? mandi.cropPrices.get(cropType) : mandi.cropPrices[cropType];

            // Profit formula (all in ₹)
            const revenue = cropPrice * quantity;
            const transport = calculateTransportCost(distance, vehicleType, fuelPrice);
            const transportCost = transport.total;
            const handlingCost = quantity * (mandi.handlingRate || 150);
            const netProfit = revenue - transportCost - handlingCost;

            // ── Capacity Validation ──────────────────────────────────
            const capacity = getVehicleCapacity(vehicleType);
            const capacityExceeded = quantity > capacity;
            let suggestedVehicle = null;
            if (capacityExceeded) {
                // Find next bigger vehicle
                if (quantity <= 3) suggestedVehicle = 'auto';
                else if (quantity <= 20) suggestedVehicle = 'tractor';
                else if (quantity <= 30) suggestedVehicle = 'miniTruck';
                else suggestedVehicle = 'largeTruck';
            }

            // ── Pooling Logic ──────────────────────────────────────────
            const matches = poolingMatches.filter(p => p.mandiId.toString() === mandi._id.toString());
            let poolingSavings = 0;
            let hasPoolingOption = false;
            let poolingFarmerCount = 0;
            let poolingSavingsPct = 0;

            if (matches.length > 0) {
                hasPoolingOption = true;
                poolingFarmerCount = matches.length;
                // Split transport cost equally among all participants
                const myCost = transportCost / (matches.length + 1);
                poolingSavings = transportCost - myCost;
                poolingSavingsPct = Math.round((poolingSavings / transportCost) * 100);
            }

            // ── Price Volatility Logic ──────────────────────────────────
            // history[0] = oldest, history[last] = newest (most recent last)
            const history = mandi.priceHistory?.get ? mandi.priceHistory.get(cropType) : mandi.priceHistory?.[cropType];
            let isFalling = false;
            let consecutiveDroppingDays = 0;
            if (history && history.length >= 2) {
                // Count how many consecutive drops from the end (newest)
                for (let i = history.length - 1; i > 0; i--) {
                    if (history[i] < history[i - 1]) {
                        consecutiveDroppingDays++;
                    } else {
                        break;
                    }
                }
                isFalling = consecutiveDroppingDays >= 3;
            }

            // ── Perishability Logic ──────────────────────────────────────
            const perishabilityRisk = getPerishabilityRisk(cropType, distance);
            const isPerishableRisk = perishabilityRisk === 'high' || perishabilityRisk === 'medium';
            const perishabilityLevel = perishabilityRisk || 'none';

            const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            return {
                mandiId: mandi._id,
                mandiName: mandi.name,
                location: mandi.location,
                distance: Math.round(distance * 10) / 10,
                cropPrice,
                revenue: Math.round(revenue),
                transportCost: Math.round(transportCost),
                transportBreakdown: {
                    fuel: transport.fuel,
                    driver: transport.base
                },
                handlingCost: Math.round(handlingCost),
                netProfit: Math.round(netProfit),
                profitMargin: Math.round(profitMargin * 10) / 10,
                // Capacity validation
                capacityExceeded,
                suggestedVehicle,
                // Pooling specific
                hasPoolingOption,
                poolingSavings: Math.round(poolingSavings),
                poolingFarmerCount,
                poolingSavingsPct,
                netProfitWithPooling: Math.round(netProfit + poolingSavings),
                // Volatility alert
                isFalling,
                consecutiveDroppingDays,
                // Perishability
                isPerishableRisk,
                perishabilityLevel,
                // Fuel rate visibility
                fuelPrice,
                fuelState: state || 'default',
                // Rest
                handlingRate: mandi.handlingRate || 150,
                isOpen: mandi.isOpen,
                demandScore: mandi.demandScore || 50,
                phone: mandi.phone,
                vehicleType,
                quantity,
                efficiency: VEHICLE_EFFICIENCY[vehicleType] || 12,
                baseRate: VEHICLE_BASE_RATE[vehicleType] || 15
            };
        });

    // Sort by netProfit descending
    results.sort((a, b) => b.netProfit - a.netProfit);

    return results.map((r, i) => ({ ...r, rank: i + 1 }));
};

module.exports = { optimizeProfits, haversineDistance };
