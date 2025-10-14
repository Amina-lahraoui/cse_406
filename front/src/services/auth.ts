const API_URL = "http://localhost:8000"; 

export const authServices = {
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: data.detail || "Authentication failed",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error) {
            return {
                success: false,
                error: "Connection error",
            };
        }
    },

    logout: async () => {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
            
            localStorage.removeItem('user');
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: "Not authenticated",
                };
            }

            const user = await response.json();
            return {
                success: true,
                status: response.status,
                data: user
            };
        } catch (error) {
            return {
                success: false,
                error: "Connection error",
            };
        }
    },
};