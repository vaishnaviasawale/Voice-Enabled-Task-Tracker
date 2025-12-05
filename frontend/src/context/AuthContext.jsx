import { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${savedToken}`,
                        },
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        setToken(savedToken);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                } catch (err) {
                    console.error("Auth check failed:", err);
                    localStorage.removeItem("token");
                    setToken(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Register new user
    const register = async (email, password, name) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Registration failed");
        }

        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    // Login user
    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Login failed");
        }

        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);

        return data;
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    // Helper to get auth headers for API calls
    const getAuthHeaders = () => ({
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!user,
                register,
                login,
                logout,
                getAuthHeaders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};



