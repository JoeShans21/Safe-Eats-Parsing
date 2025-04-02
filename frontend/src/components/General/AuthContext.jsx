import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getCurrentUser } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Store additional user data in your API/database
  const saveUserData = async (userId, userData) => {
    // This function would save user data to your FastAPI backend
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userId,
          ...userData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      return await response.json();
    } catch (error) {
      await showToast('Error saving user data');
      throw error;
    }
  };

  // Get user token for backend requests
  const getUserToken = async () => {
    try {
      if (!currentUser) return null;
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    saveUserData,
    getUserToken,
    showToast
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};