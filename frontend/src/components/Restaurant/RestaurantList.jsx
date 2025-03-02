import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const fetchRestaurants = async () => {
      try {
        const data = await api.getRestaurants();
        setRestaurants(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load restaurants');
        await showToast('Failed to load restaurants');
        console.error('Error fetching restaurants:', error);
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">All Restaurants</h2>
        <Link 
          to="/add-restaurant"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Restaurant
        </Link>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No restaurants added yet.</p>
          <Link 
            to="/add-restaurant"
            className="inline-block mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Add Your First Restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="bg-white shadow rounded-lg p-5">
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-1">Cuisine: {restaurant.cuisine_type}</p>
              <p className="text-gray-600 mb-3 text-sm truncate">{restaurant.address}</p>
              
              <div className="flex space-x-2 mt-4">
                <Link 
                  to={`/restaurant/${String(restaurant.id)}`}  // Ensure ID is a string
                  className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;