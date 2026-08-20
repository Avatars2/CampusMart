import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check token on initial load
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const signIn = async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
