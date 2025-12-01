import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 9000,
});

export const authAPI = {
    getProfile: async (token) => {
        const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    checkUsername: async (username) => {
        const response = await api.get(`/auth/check-username/${username}`);
        return response.data;
    },
    registerAdmin: async (adminData, token) => {
        const response = await api.post('/auth/register-admin', adminData, {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};

export const orderAPI = {
    // Get all orders (Admin only)
    getAllOrders: async (token) => {
        const response = await api.get('/payment/admin/orders', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    // Get geography data (sales by state)
    getGeographyData: async (token) => {
        const response = await api.get('/payment/admin/geography', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    },
    // Get order locations for map markers
    getOrderLocations: async (token) => {
        const response = await api.get('/payment/admin/order-locations', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};

export const userAPI = {
    // Get all users (Admin only) - fetch all without pagination
    getAllUsers: async (token) => {
        const response = await api.get('/user?limit=10000', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};

export default api;

