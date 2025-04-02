import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';
import MenuItemForm from '../Menu/MenuItemForm'; // Import the MenuItemForm component

const allergenOptions = [
  { id: 'milk', label: 'Milk', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'tree_nuts', label: 'Tree Nuts', icon: '🌰' },
  { id: 'wheat', label: 'Wheat', icon: '🌾' },
  { id: 'crustaceans', label: 'Crustaceans', icon: '🦀' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'soybeans', label: 'Soybeans', icon: '🫘' },
  { id: 'sesame', label: 'Sesame', icon: '✨' }
];

const dietaryCategories = [
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' }
];


const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({ text: message, duration: 'short', position: 'bottom' });
    } else {
      alert(message);
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const restaurantData = await api.getRestaurants();
      const restaurant = restaurantData.find(r => String(r.id) === restaurantId);

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

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const handleDelete = async (menuItemId) => {
    try {
      // Find the menu item to get its name
      const menuItem = menuItems.find(item => item.id === menuItemId);
      if (!menuItem) return;
  
      // Show confirmation dialog with item name bolded
      if (!window.confirm(`Are you sure you want to delete "${menuItem.name}" (id: ${menuItemId})?`)) {
        return;
      }
  
      await api.deleteMenuItem(restaurantId, menuItemId);
      
      // Refresh the menu items list
      await showToast('Menu item deleted successfully');
      
      // Update the UI by removing the deleted item
      setMenuItems(menuItems.filter(item => item.id !== menuItemId));
    } catch (error) {
      await showToast('Failed to delete menu item');
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (menuItemId) => {
    // Store the original item before starting to edit
    const itemToEdit = menuItems.find(item => item.id === menuItemId);
    setOriginalItem(itemToEdit);
  
    // Toggle editing state for this item
    setEditingItemId(editingItemId === menuItemId ? null : menuItemId);
  };

  const handleCancelEdit = () => {
    // If we have the original item, replace the current edited item with it
    if (originalItem) {
      setMenuItems(menuItems.map(item => 
        item.id === originalItem.id ? originalItem : item
      ));
    }
  
    // Reset editing state
    setEditingItemId(null);
    setOriginalItem(null);
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      // Send the updated item to the API
      await api.updateMenuItem(restaurantId, updatedItem.id, updatedItem);
      
      // Update the local items list
      setMenuItems(menuItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      
      // Exit edit mode
      setEditingItemId(null);
      
      await showToast('Menu item updated successfully');
    } catch (error) {
      await showToast('Failed to update menu item');
      console.error('Update error:', error);
    }
  };

  const handleFormChange = (updatedData) => {
    // Find the item being edited
    const itemIndex = menuItems.findIndex(item => item.id === editingItemId);
    if (itemIndex === -1) return;

    // Create a new array with the updated item
    const updatedItems = [...menuItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      ...updatedData
    };

    // Update state
    setMenuItems(updatedItems);
  };

  if (loading) {
    return <div className="text-center p-6">Loading restaurant information...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-8">{restaurant.name}</h2>

      <div className="mb-6 w-full">
        <h3 className="text-2xl font-semibold mb-8 text-center">Menu Items</h3>
        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items added yet. Click the button below to add your first items!</p>
        ) : (
          <ul className="space-y-4 w-full">
            {menuItems.map((item, index) => (
              <li key={item.id} className="border rounded-lg p-4 shadow-sm">
                {editingItemId === item.id ? (
                  <div>
                    <MenuItemForm 
                      formIndex={index}
                      onRemove={() => handleDelete(item.id)} // Connect the remove function to handleDelete, deletes item
                      onFormChange={handleFormChange}
                      initialData={{
                        ...item,
                        // Store both numeric and formatted values
                        priceNumeric: typeof item.price === 'string' && item.price.includes('$') 
                                    ? parseFloat(item.price.replace(/[^\d.]/g, ''))
                                    : typeof item.price === 'number'
                                      ? item.price
                                      : 0,
                        price: typeof item.price === 'string' && item.price.includes('$')
                              ? item.price
                              : typeof item.price === 'number'
                                ? `$${item.price.toFixed(2)}`
                                : '$0.00'
                      }}
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(menuItems.find(i => i.id === editingItemId))}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show compact view when not editing
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
                      
                      {/* Display allergens */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="mt-1 text-sm">
                          <span className="text-gray-700">Allergens: </span>
                          {item.allergens.map(id => {
                            const allergenOption = allergenOptions.find(a => a.id === id);
                            return allergenOption ? (
                              <span key={id} className="mr-1">
                                {allergenOption.icon}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      
                      {/* Display dietary categories */}
                      {item.dietaryCategories && item.dietaryCategories.length > 0 && (
                        <div className="mt-1 text-sm">
                          <span className="text-gray-700">Dietary: </span>
                          {item.dietaryCategories.map(id => {
                            const dietaryOption = dietaryCategories.find(d => d.id === id);
                            return dietaryOption ? (
                              <span key={id} className="mr-1">
                                {dietaryOption.icon}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button 
  onClick={() => navigate(`/restaurant/${restaurantId}/menu`)}
  className="mx-auto w-full max-w-72 text-center bg-[#8DB670] rounded-xl pt-4 pb-4 font-semibold text-white mt-6 hover:bg-[#6c8b55]"
>
  Create New Items
</button>
    </div>
  );
};


export default RestaurantPage;