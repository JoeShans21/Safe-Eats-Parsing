import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const BASE_URL = Capacitor.isNativePlatform() 
  ? 'https://your-production-api.com'
  : window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : 'https://restaurant-allergy-manager.vercel.app/'; // Use your actual Vercel URL here

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
  }
};