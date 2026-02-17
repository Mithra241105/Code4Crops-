import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getMandis = async () => {
    try {
        const response = await api.get('/mandis');
        return response.data;
    } catch (error) {
        console.error('Error fetching mandis:', error);
        throw error;
    }
};

export const optimizeRoute = async (quantity, vehicleType) => {
    try {
        const response = await api.post('/optimize', {
            quantity,
            vehicleType,
        });
        return response.data;
    } catch (error) {
        console.error('Error optimizing route:', error);
        throw error;
    }
};

export default api;
