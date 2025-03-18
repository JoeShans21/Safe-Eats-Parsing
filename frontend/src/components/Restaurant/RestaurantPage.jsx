import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api'; // Ensure this points to your `api.js`

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate(); // Get the navigate function
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({ text: message, duration: 'short', position: 'bottom' });
    }
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const restaurantData = await api.getRestaurants();
        const restaurant = restaurantData.find(r => String(r.id) === restaurantId); // Ensure ID match
  
        if (!restaurant) {
          setError('Restaurant not found');
          await showToast('Restaurant not found');
          return;
        }
  
        setRestaurant(restaurant);
  
        // Fetch menu items
        const menuData = await api.getMenuItems(restaurantId);
        setMenuItems(menuData);
  
      } catch (error) {
        setError('Failed to load restaurant information');
        await showToast('Failed to load restaurant information');
      } finally {
        setLoading(false);
      }
    };
  
    fetchRestaurantData();
  }, [restaurantId]);

  if (loading) {
    return <div className="text-center p-6">Loading restaurant information...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-8">{restaurant.name}</h2>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-8 text-center">Menu Items</h3>
        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items added yet. Click the button below to add your first items!</p>
        ) : (
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>{item.name} - ${item.price}</li>
            ))}
          </ul>
        )}
      </div>
      <button 
        onClick={() => navigate(`/${restaurantId}/add`)} // Use navigate
        className="mx-auto w-full max-w-72 text-center bg-[#8DB670] rounded-xl pt-4 pb-4 font-semibold text-white mt-2 hover:bg-[#6c8b55]"
      >
        Create New Items
      </button>
    </div>
  );
};

export default RestaurantPage;
