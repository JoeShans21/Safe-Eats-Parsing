import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const getBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return 'https://your-production-api.com';
  }
  
  // Check if running locally
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // When deployed on Render
  return 'https://restaurant-allergy-manager-backend.onrender.com'; 
};

const BASE_URL = getBaseUrl();

console.log('Using API URL:', BASE_URL);



export const api = {
  createRestaurant: async (restaurantData) => {
    try {
      const response = await CapacitorHttp.request({
        method: 'POST',
        url: `${BASE_URL}/restaurants/`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: restaurantData
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Failed to create restaurant');
      }
      
      return response.data;
    } catch (error) {
      console.error('Detailed error:', error);
      throw error;
    }
  },

  getRestaurants: async () => {
    try {
      const response = await CapacitorHttp.request({
        method: 'GET',
        url: `${BASE_URL}/restaurants`,
        headers: {
          'Accept': 'application/json'
        }
      });
      
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
      const response = await CapacitorHttp.request({
        method: 'POST',
        url: `${BASE_URL}/restaurants/${restaurantId}/menu`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: menuItemData
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Failed to add menu item');
      }
      
      return response.data;
    } catch (error) {
      console.error('Detailed error:', error);
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

      const response = await CapacitorHttp.request({
        method: 'GET',
        url,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Failed to fetch menu items');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  updateMenuItem: async (restaurantId, menuItemId, menuItemData) => {
    try {
      const response = await CapacitorHttp.request({
        method: 'PUT',
        url: `${BASE_URL}/restaurants/${restaurantId}/menu/${menuItemId}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: menuItemData
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Failed to update menu item');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  deleteMenuItem: async (restaurantId, menuItemId) => {
    try {
      const response = await CapacitorHttp.request({
        method: 'DELETE',
        url: `${BASE_URL}/restaurants/${restaurantId}/menu/${menuItemId}`,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData?.detail || 'Failed to delete menu item');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }
};
