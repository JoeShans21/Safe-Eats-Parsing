import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const getBaseUrl = () => {
  // Check if running locally
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // When deployed on Render
  return 'https://restaurant-allergy-manager-backend.onrender.com'; 
};

const BASE_URL = getBaseUrl();

console.log('Using API URL:', BASE_URL);

// Helper for getting auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Set authentication token
const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Set user ID
const setUserId = (uid) => {
  localStorage.setItem('user_id', uid);
};

// Get user ID
const getUserId = () => {
  return localStorage.getItem('user_id');
};

// Clear authentication data
const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('restaurant_id');
};

// Set restaurant ID
const setRestaurantId = (restaurantId) => {
  if (restaurantId) {
    localStorage.setItem('restaurant_id', restaurantId);
  }
};

// Get restaurant ID
const getRestaurantId = () => {
  return localStorage.getItem('restaurant_id');
};

// HTTP request wrapper with authorization
const httpRequest = async (options) => {
  try {
    // Add authorization header if not already set
    if (!options.headers?.Authorization) {
      const token = getAuthToken();
      if (token) {
        if (!options.headers) {
          options.headers = {};
        }
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await CapacitorHttp.request(options);
    
    // Handle unauthorized responses
    if (response.status === 401) {
      console.warn('Received 401 Unauthorized response');
      // Clear auth data
      clearAuthData();
      // Throw error to be caught by caller
      throw new Error('Your session has expired. Please log in again.');
    }
    
    return response;
  } catch (error) {
    console.error('HTTP request error:', error);
    throw error;
  }
};

export const api = {
  // Authentication methods
  registerUser: async (userData) => {
    try {
      const response = await CapacitorHttp.request({
        method: 'POST',
        url: `${BASE_URL}/auth/register`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: userData
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Registration failed');
      }
      
      // Store token and user data directly
      setAuthToken(response.data.token);
      setUserId(response.data.uid);
      
      if (response.data.restaurantId) {
        setRestaurantId(response.data.restaurantId);
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  loginUser: async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      
      const response = await CapacitorHttp.request({
        method: 'POST',
        url: `${BASE_URL}/auth/login`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: { email, password }
      });
      
      console.log('Login response status:', response.status);
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Login failed');
      }
      
      console.log('Login successful, storing token and user data');
      
      // Store token and user data directly
      setAuthToken(response.data.token);
      setUserId(response.data.uid);
      
      if (response.data.restaurantId) {
        setRestaurantId(response.data.restaurantId);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logoutUser: async () => {
    try {
      // Call the logout endpoint if we have a token
      const token = getAuthToken();
      if (token) {
        await httpRequest({
          method: 'POST',
          url: `${BASE_URL}/auth/logout`,
          headers: {
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      clearAuthData();
    }
  },
  
  getCurrentUser: async () => {
    const token = getAuthToken();
    if (!token) {
      return null;
    }
    
    try {
      const response = await httpRequest({
        method: 'GET',
        url: `${BASE_URL}/auth/user`,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        clearAuthData();
        throw new Error(response.data?.detail || 'Failed to get user data');
      }
      
      // Update stored restaurant ID if it exists
      if (response.data.restaurantId) {
        setRestaurantId(response.data.restaurantId);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      clearAuthData();
      return null;
    }
  },
  
  // Restaurant management methods
  createRestaurant: async (restaurantData) => {
    try {
      // Add owner_uid to restaurant data
      const uid = getUserId();
      const enrichedData = {
        ...restaurantData,
        owner_uid: uid
      };
      
      const response = await httpRequest({
        method: 'POST',
        url: `${BASE_URL}/restaurants/`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: enrichedData
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to create restaurant');
      }
      
      // Store the restaurant ID
      if (response.data.id) {
        setRestaurantId(response.data.id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },

  getRestaurants: async () => {
    try {
      const response = await httpRequest({
        method: 'GET',
        url: `${BASE_URL}/restaurants`,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to fetch restaurants');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  addMenuItem: async (restaurantId, menuItemData) => {
    try {
      const response = await httpRequest({
        method: 'POST',
        url: `${BASE_URL}/restaurants/${restaurantId}/menu`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: menuItemData
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to add menu item');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },

  getMenuItems: async (restaurantId, filters = {}) => {
    try {
      const { dietaryCategory, allergenFree } = filters;
      let url = `${BASE_URL}/restaurants/${restaurantId}/menu`;
      
      // Add query parameters if filters are provided
      const queryParams = new URLSearchParams();
      if (dietaryCategory) {
        queryParams.append('dietary_category', dietaryCategory);
      }
      if (allergenFree && allergenFree.length > 0) {
        allergenFree.forEach(allergen => {
          queryParams.append('allergen_free', allergen);
        });
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await httpRequest({
        method: 'GET',
        url,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to fetch menu items');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },
  
  // Debug helper
  debugAuthState: () => {
    const token = getAuthToken();
    const userId = getUserId();
    const restaurantId = getRestaurantId();
    
    console.group('Authentication State Debug');
    console.log('Has token:', !!token);
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 10) + '...');
    }
    console.log('User ID:', userId || 'None');
    console.log('Restaurant ID:', restaurantId || 'None');
    console.groupEnd();
    
    return {
      isAuthenticated: !!token,
      hasUserId: !!userId,
      hasRestaurantId: !!restaurantId
    };
  }
};