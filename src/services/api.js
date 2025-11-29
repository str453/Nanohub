import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout:30000,
});

export const authAPI = {
    register: async(userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password});
        return response.data;
    },

    checkUsername: async (username) => {
        const response = await api.get(`/auth/check-username/${username}`);
        return response.data;
    },

    getProfile: async (token) => {
        const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};

export const productAPI = {
    // Get all products (set high limit to get everything)
    getAllProducts: async () => {
        const response = await api.get('/product?limit=10000');
        return response.data;
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        const response = await api.get(`/product/category/${category}`);
        return response.data;
    },

    getProductsByCategoryPaginated: async (category, page=1, limit=20) =>{
        const response = await api.get(`/product/category/${category}?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get single product by ID
    getProductById: async (id) => {
        const response = await api.get(`/product/${id}`);
        return response.data;
    },

    // Search products
    searchProducts: async (searchTerm) => {
        const response = await api.get(`/product?search=${searchTerm}`);
        return response.data;
    }
};

export const paymentAPI = {
    // Create payment intent
    createPaymentIntent: async (amount, token) => {
        const response = await api.post('/payment/create-payment-intent', 
            { amount },
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response.data;
    },

    // Create order after payment
    createOrder: async (orderData, token) => {
        const response = await api.post('/payment/create-order',
            orderData,
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response.data;
    },

    // Get user's orders
    getOrders: async (token) => {
        const response = await api.get('/payment/orders',
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response.data;
    },

    // Get single order
    getOrderById: async (orderId, token) => {
        const response = await api.get(`/payment/orders/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response.data;
    }
};

export default api;