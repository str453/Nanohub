import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timoout:9000,
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

    getProfile: async (token) => {
        const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}`}
        });
        return response.data;
    }
};

export default api;