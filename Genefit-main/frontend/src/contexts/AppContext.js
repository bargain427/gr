import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, dashboardAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Create or get user (simplified for demo - in production you'd have proper auth)
  const initializeUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to create user (in real app, this would be login/register flow)
      const newUser = await userAPI.create(userData);
      setUser(newUser);
      
      // Load dashboard data
      await loadDashboardData(newUser.id);
      
      // Store user in localStorage for persistence
      localStorage.setItem('genefit_user', JSON.stringify(newUser));
      
      return newUser;
    } catch (err) {
      console.error('Error initializing user:', err);
      setError(err.response?.data?.detail || 'Failed to initialize user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (userId) => {
    try {
      const data = await dashboardAPI.getDashboard(userId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setLoading(true);
      const updatedUser = await userAPI.update(userId, userData);
      setUser(updatedUser);
      localStorage.setItem('genefit_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    if (user) {
      await loadDashboardData(user.id);
    }
  };

  // Initialize user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('genefit_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        loadDashboardData(userData.id);
      } catch (err) {
        console.error('Error loading stored user:', err);
        localStorage.removeItem('genefit_user');
      }
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    dashboardData,
    initializeUser,
    updateUser,
    refreshDashboard,
    setError
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};