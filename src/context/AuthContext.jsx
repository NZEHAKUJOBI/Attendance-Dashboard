import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Try to login with the backend
      const { data } = await api.post("/auth/login", { email, password });

      // Store token and user data
      localStorage.setItem("token", data.token);
      const userData = {
        email: data.user?.email || email,
        role: data.user?.role || "User",
        name: data.user?.fullName || data.user?.name || "User",
        id: data.user?.id,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error("Login error:", error);

      // For development/demo purposes - allow demo login
      if (email === "admin@demo.com" && password === "password") {
        const demoUser = {
          email: "admin@demo.com",
          role: "Admin",
          name: "Demo Admin",
          id: "demo-id",
        };
        const demoToken = "demo-token-12345";

        localStorage.setItem("token", demoToken);
        localStorage.setItem("user", JSON.stringify(demoUser));
        setUser(demoUser);

        return { success: true, message: "Demo login successful" };
      }

      // Return error for real failed attempts
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
