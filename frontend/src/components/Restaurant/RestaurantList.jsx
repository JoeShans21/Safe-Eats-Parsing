import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

// Add CSS for animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    } else {
      // Use custom success message instead
      setSuccessMessage(message);
      setShowSuccessMessage(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
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

  const confirmDelete = (restaurant) => {
    setRestaurantToDelete(restaurant);
    setShowConfirmDialog(true);
  };

  const cancelDeletion = () => {
    setShowConfirmDialog(false);
    setRestaurantToDelete(null);
  };

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await api.deleteRestaurant(restaurantToDelete.id);
      
      // Show success message
      setSuccessMessage(`${restaurantToDelete.name} deleted successfully`);
      setShowSuccessMessage(true);
      
      // Update UI by removing deleted restaurant
      setRestaurants(restaurants.filter(r => r.id !== restaurantToDelete.id));
      
      // Close confirmation dialog
      setShowConfirmDialog(false);
      setRestaurantToDelete(null);
      
      // Auto-hide success message
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      await showToast('Failed to delete restaurant');
      console.error('Delete error:', error);
      
      // Close dialog even on error
      setShowConfirmDialog(false);
      setRestaurantToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-[Roboto_Flex]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8DB670]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-[Roboto_Flex]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-[Roboto_Flex]">
      <style>{styles}</style>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">All Restaurants</h2>
        <Link 
          to="/add-restaurant"
          className="bg-[#8DB670] text-white py-2.5 px-5 rounded-xl hover:bg-[#6c8b55] focus:outline-none focus:ring-2 focus:ring-[#8DB670] transition font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Restaurant
        </Link>
      </div>
      
      {restaurants.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-md border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v18H3zM3 9h18M9 21V9" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">No Restaurants Yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first restaurant</p>
          <Link 
            to="/add-restaurant"
            className="inline-block bg-[#8DB670] text-white py-2.5 px-6 rounded-xl hover:bg-[#6c8b55] transition font-medium"
          >
            Add Your First Restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="p-6 relative">
                {/* Only Delete button in top right corner */}
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => confirmDelete(restaurant)}
                    className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition"
                    title="Delete Restaurant"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Restaurant details */}
                <div className="pr-14">
                  <h3 className="text-xl font-semibold mb-3">{restaurant.name}</h3>
                  
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                    </svg>
                    <span className="text-gray-700">{restaurant.cuisine_type || 'Not specified'}</span>
                  </div>
                  
                  {restaurant.address && (
                    <div className="flex items-start mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700 text-sm truncate">{restaurant.address}</span>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700 text-sm">{restaurant.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-5 flex space-x-3 items-center">
                  <Link 
                    to={`/restaurant/${String(restaurant.id)}`}
                    className="bg-[#8DB670] text-white py-2 px-4 rounded-lg hover:bg-[#6c8b55] text-sm transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View Details
                  </Link>
                  
                  <Link 
                    to={`/edit-restaurant/${String(restaurant.id)}`}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-sm transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Dialog for Delete */}
      {showConfirmDialog && restaurantToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-semibold">{restaurantToDelete.name}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeletion}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Success</h3>
            </div>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;