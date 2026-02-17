// Calculation utilities for profit analysis

export const calculateProfitMargin = (netProfit, revenue) => {
    if (revenue === 0) return 0;
    return ((netProfit / revenue) * 100).toFixed(2);
};

export const calculateTravelTime = (distance, vehicleType) => {
    // Average speeds in km/h
    const speeds = {
        bike: 40,
        auto: 35,
        miniTruck: 45,
        tractor: 25,
        truck: 50,
    };

    const speed = speeds[vehicleType] || 40;
    const hours = distance / speed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
};

export const calculateRiskLevel = (distance) => {
    if (distance < 40) return 'Low';
    if (distance < 70) return 'Medium';
    return 'High';
};

export const getRiskColor = (risk) => {
    switch (risk) {
        case 'Low':
            return 'success';
        case 'Medium':
            return 'warning';
        case 'High':
            return 'error';
        default:
            return 'default';
    }
};

export const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: '🥇', label: 'Gold', color: '#FFD700' };
    if (rank === 2) return { emoji: '🥈', label: 'Silver', color: '#C0C0C0' };
    if (rank === 3) return { emoji: '🥉', label: 'Bronze', color: '#CD7F32' };
    return { emoji: `#${rank}`, label: `Rank ${rank}`, color: '#757575' };
};

export const calculateOptimization = (mandis, formData) => {
    const { quantity, vehicleType, fuelPrice = 100, handlingCost = 2 } = formData;

    const vehicleCosts = {
        bike: 5,
        auto: 8,
        miniTruck: 12,
        tractor: 15,
        truck: 20,
    };

    const costPerKm = vehicleCosts[vehicleType] || 10;

    return mandis.map((mandi) => {
        const revenue = quantity * mandi.price;
        const transportCost = mandi.distance * costPerKm;
        const totalHandlingCost = quantity * handlingCost;
        const netProfit = revenue - transportCost - totalHandlingCost;
        const profitMargin = calculateProfitMargin(netProfit, revenue);
        const travelTime = calculateTravelTime(mandi.distance, vehicleType);
        const riskLevel = calculateRiskLevel(mandi.distance);

        return {
            ...mandi,
            revenue,
            transportCost,
            handlingCost: totalHandlingCost,
            netProfit,
            profitMargin,
            travelTime,
            riskLevel,
        };
    }).sort((a, b) => b.netProfit - a.netProfit)
        .map((mandi, index) => ({
            ...mandi,
            rank: index + 1,
        }));
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};
