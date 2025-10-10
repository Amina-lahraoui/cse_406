const API_URL = "http://localhost:8000";

interface AuthResponse {
    message: string;
    user: {
        id: number;
        language: string;
    };
}

export const authServices = {
    async login(email: string, password: string): Promise<{ status: number; data?: AuthResponse; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    status: response.status,
                    error: data.detail || "Connection error",
                };
            }

            return {
                status: response.status,
                data,
            };
        } catch (error) {
            return {
                status: 500,
                error: "Server connection error",
            };
        }
    },

    async logout(): Promise<void> {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error during disconnection:", error);
        }
    },

    async getCurrentUser(): Promise<{ status: number; user?: any; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                return {
                    status: response.status,
                    error: "Not authenticated",
                };
            }

            const user = await response.json();
            return {
                status: response.status,
                user,
            };
        } catch (error) {
            return {
                status: 500,
                error: "Connection error",
            };
        }
    },
};