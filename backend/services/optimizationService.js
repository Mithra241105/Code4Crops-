const { getFuelPrice, calculateTransportCost } = require('./fuelService');

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
 * @param {Object} params - { farmerLat, farmerLng, cropType, quantity (quintals), vehicleType, state }
 * @param {Array} mandis - Array of Mandi documents
 */
const optimizeProfits = (params, mandis) => {
    const { farmerLat, farmerLng, cropType, quantity, vehicleType, state = 'default' } = params;
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
            const revenue = cropPrice * quantity;                              // ₹/quintal × quintals
            const transportCost = calculateTransportCost(distance, vehicleType, fuelPrice);
            const handlingCost = quantity * (mandi.handlingRate || 150);  // ₹/quintal × quintals
            const netProfit = revenue - transportCost - handlingCost;

            return {
                mandiId: mandi._id,
                mandiName: mandi.name,
                location: mandi.location,
                distance: Math.round(distance * 10) / 10,
                cropPrice,
                revenue: Math.round(revenue),
                transportCost: Math.round(transportCost),
                handlingCost: Math.round(handlingCost),
                netProfit: Math.round(netProfit),
                handlingRate: mandi.handlingRate || 150,
                fuelPrice,
                isOpen: mandi.isOpen,
                demandScore: mandi.demandScore || 50,
                phone: mandi.phone,
            };
        });

    // Sort by netProfit descending
    results.sort((a, b) => b.netProfit - a.netProfit);

    return results.map((r, i) => ({ ...r, rank: i + 1 }));
};

module.exports = { optimizeProfits, haversineDistance };
