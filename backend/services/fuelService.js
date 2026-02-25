// Region-based fuel prices (₹ per litre) - updated periodically
// These are approximate 2024 values for major Indian states
const FUEL_PRICES_BY_STATE = {
    'Maharashtra': 104.65,
    'Karnataka': 102.86,
    'Tamil Nadu': 100.94,
    'Andhra Pradesh': 111.01,
    'Telangana': 109.53,
    'Gujarat': 94.26,
    'Rajasthan': 106.45,
    'Madhya Pradesh': 108.65,
    'Uttar Pradesh': 96.57,
    'Bihar': 107.26,
    'Punjab': 97.32,
    'Haryana': 96.21,
    'West Bengal': 106.88,
    'Odisha': 103.19,
    'Jharkhand': 99.22,
    'default': 100.00,
};

// Vehicle fuel efficiency (km per litre)
const VEHICLE_EFFICIENCY = {
    bike: 45,
    auto: 22,
    miniTruck: 12,
    largeTruck: 8,
    tractor: 6,
};

// Base rate per km (₹) - includes driver cost + maintenance
const VEHICLE_BASE_RATE = {
    bike: 3.5,
    auto: 7,
    miniTruck: 15,
    largeTruck: 25,
    tractor: 12,
};

// Max capacity in quintals
const VEHICLE_CAPACITY = {
    bike: 1,
    auto: 3,
    miniTruck: 30,
    largeTruck: 100,
    tractor: 20,
};

const getFuelPrice = (state) => {
    return FUEL_PRICES_BY_STATE[state] || FUEL_PRICES_BY_STATE['default'];
};

const calculateTransportCost = (distanceKm, vehicleType, fuelPrice) => {
    const efficiency = VEHICLE_EFFICIENCY[vehicleType] || 12;
    const baseRate = VEHICLE_BASE_RATE[vehicleType] || 15;
    // Fuel cost component
    const fuelCost = (distanceKm / efficiency) * fuelPrice;
    // Base cost (driver + wear)
    const baseCost = distanceKm * baseRate;
    return Math.round(fuelCost + baseCost);
};

const getVehicleCapacity = (vehicleType) => VEHICLE_CAPACITY[vehicleType] || 30;

module.exports = { getFuelPrice, calculateTransportCost, getVehicleCapacity, VEHICLE_CAPACITY, VEHICLE_BASE_RATE };
