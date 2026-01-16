// admin-panel/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    },

    auth: {
        login: (email, password) => api.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        register: (email, password, full_name) => api.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name }),
        }),
        getProfile: () => api.request('/auth/profile'),
    },

    admin: {
        getStats: () => api.request('/admin/stats'),
        getLogs: (params) => {
            const query = new URLSearchParams(params).toString();
            return api.request(`/admin/logs?${query}`);
        },
        createProduct: (data) => api.request('/admin/create-product', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        createApiKey: (data) => api.request('/admin/create-apikey', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateApiKey: (id, data) => api.request(`/admin/apikey/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    },

    customer: {
        getProducts: () => api.request('/customer/products'),
        getApiKeys: () => api.request('/customer/apikeys'),
        getOrders: () => api.request('/customer/orders'),
        updateApiKeyDomains: (id, domains) => api.request(`/customer/apikey/${id}/domains`, {
            method: 'PATCH',
            body: JSON.stringify({ allowed_domains: domains }),
        }),
    },
};

export default api;
