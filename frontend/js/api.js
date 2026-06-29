const API_BASE = '/api';

const api = {
    token: localStorage.getItem('access_token'),

    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 && this.token) {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        config.headers['Authorization'] = `Bearer ${this.token}`;
                        const retryResponse = await fetch(`${API_BASE}${endpoint}`, config);
                        const retryData = await retryResponse.json();
                        if (!retryResponse.ok) {
                            throw { status: retryResponse.status, ...retryData };
                        }
                        return retryData;
                    } else {
                        this.logout();
                        throw { status: 401, error: 'Session expired' };
                    }
                }
                throw { status: response.status, ...data };
            }

            return data;
        } catch (error) {
            if (error.status) throw error;
            throw { status: 0, error: 'Network error' };
        }
    },

    get(endpoint, params = {}) {
        const query = Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    post(endpoint, data) {
        const isForm = data instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isForm ? data : data,
            headers: isForm ? {} : {},
        });
    },

    put(endpoint, data) {
        const isForm = data instanceof FormData;
        return this.request(endpoint, {
            method: 'PUT',
            body: isForm ? data : data,
            headers: isForm ? {} : {},
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refresh}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) return false;
            const data = await response.json();
            this.token = data.access_token;
            localStorage.setItem('access_token', data.access_token);
            return true;
        } catch {
            return false;
        }
    },

    setToken(access, refresh) {
        this.token = access;
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
    },

    logout() {
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!this.token;
    },

    getUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    },

    // Auth
    login(email, password) {
        return this.post('/auth/login', { email, password });
    },
    register(data) {
        return this.post('/auth/register', data);
    },
    getProfile() {
        return this.get('/auth/profile');
    },
    updateProfile(data) {
        return this.put('/auth/profile', data);
    },

    // Services
    getServices(params) {
        return this.get('/services/', params);
    },
    getService(slug) {
        return this.get(`/services/${slug}`);
    },
    getCategories() {
        return this.get('/services/categories');
    },

    // Appointments
    getAppointments(params) {
        return this.get('/appointments/', params);
    },
    getAppointment(id) {
        return this.get(`/appointments/${id}`);
    },
    createAppointment(data) {
        return this.post('/appointments/', data);
    },
    updateAppointment(id, data) {
        return this.put(`/appointments/${id}`, data);
    },
    cancelAppointment(id) {
        return this.delete(`/appointments/${id}`);
    },
    getAvailableSlots(serviceId, date) {
        return this.get('/appointments/available-slots', { service_id: serviceId, date });
    },

    // Reviews
    getReviews(params) {
        return this.get('/reviews/', params);
    },
    createReview(data) {
        return this.post('/reviews/', data);
    },

    // Contact
    sendContact(data) {
        return this.post('/contact/', data);
    },

    // Gallery
    getGallery(params) {
        return this.get('/gallery/', params);
    },

    // Admin
    getDashboard() {
        return this.get('/admin/dashboard');
    },
    getRevenueReport(period) {
        return this.get('/admin/reports/revenue', { period });
    },
    getServiceReport() {
        return this.get('/admin/reports/services');
    },
    getCalendarEvents(start, end) {
        return this.get('/admin/appointments/calendar', { start, end });
    },
    getUsers(params) {
        return this.get('/admin/users', params);
    },
    toggleUserStatus(userId) {
        return this.put(`/admin/users/${userId}/toggle-status`);
    },
    deleteUser(userId) {
        return this.delete(`/admin/users/${userId}`);
    },
    getContactMessages(params) {
        return this.get('/contact/', params);
    },
    markMessageRead(id) {
        return this.put(`/contact/${id}/read`);
    },
    markMessageReplied(id) {
        return this.put(`/contact/${id}/reply`);
    },
    deleteMessage(id) {
        return this.delete(`/contact/${id}`);
    },
    getAppointmentStats() {
        return this.get('/appointments/stats');
    },
};
