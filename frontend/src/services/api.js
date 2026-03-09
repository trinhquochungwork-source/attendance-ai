const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const authService = {
    async login(identifier, password) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });
        return await res.json();
    },

    async register(userData) {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return await res.json();
    },

    async forgotPassword(identifier) {
        const res = await fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
        });
        return await res.json();
    },

    async resetPassword(identifier, code, newPassword) {
        const res = await fetch(`${BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, code, new_password: newPassword }),
        });
        return await res.json();
    },
};

export const WS_STREAM_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001/ws/stream';
