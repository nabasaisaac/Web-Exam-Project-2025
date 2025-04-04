import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";

// Create the authentication context
const AuthContext = createContext();

/**
 * Authentication provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role
   * @returns {Promise} - Login result
   */
  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password, role);
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.register(userData);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info("You have been logged out");
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the auth context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
