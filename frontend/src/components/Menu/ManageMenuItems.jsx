import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import MenuItemForm from './MenuItemForm';

const ManageMenuItems = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuForms, setMenuForms] = useState([0]); // Start with a single form with index 0
  const [menuItemsData, setMenuItemsData] = useState({}); // Use an object with form indices as keys
  const { restaurantId } = useParams(); // Get restaurantId from URL
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.getRestaurants();
        setRestaurants(response);
      } catch (error) {
        console.error("Failed to fetch restaurants", error);
      }
    };
    fetchRestaurants();
  }, []);

  // Handle navigation back to restaurant page
  const handleBackToRestaurant = () => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const addMenuItem = () => {
    const newFormIndex = menuForms.length > 0 ? Math.max(...menuForms) + 1 : 0;
    setMenuForms([...menuForms, newFormIndex]);
  };

  const removeMenuItem = (indexToRemove) => {
    setMenuForms(menuForms.filter(index => index !== indexToRemove));
    
    // Also remove this form's data from menuItemsData
    setMenuItemsData(prevData => {
      const newData = { ...prevData };
      delete newData[indexToRemove];
      return newData;
    });
  };

  // Update data for a specific form - we use a memoized callback to prevent infinite loops
  const handleFormChange = (index, data) => {
    setMenuItemsData(prevData => {
      // Only update if data has actually changed
      if (JSON.stringify(prevData[index]) !== JSON.stringify(data)) {
        return {
          ...prevData,
          [index]: data
        };
      }
      return prevData;
    });
  };

  // Handle the submission of all items at once
  const handleAddAllItems = async () => {
    if (!restaurantId) {
      alert('Restaurant ID is missing!');
      return;
    }

    // Convert object to array and filter out any undefined values
    const itemsToAdd = Object.values(menuItemsData).filter(item => 
      item && item.name && item.price // Basic validation
    );

    if (itemsToAdd.length === 0) {
      alert('No valid menu items to add!');
      return;
    }

    try {
      console.log('Adding menu items:', itemsToAdd);

      // Use Promise.all to send all requests in parallel
      const addItemPromises = itemsToAdd.map((itemData) =>
        api.addMenuItem(restaurantId, itemData)
      );

      // Wait for all the promises to resolve
      await Promise.all(addItemPromises);

      alert('All menu items added successfully!');
      
      // Navigate back to restaurant page after successful addition
      navigate(`/restaurant/${restaurantId}`);
      
    } catch (error) {
      console.error('Failed to add menu items', error);
      alert('Error adding menu items.');
    }
  };

  return (
    <div className="container mx-auto p-4">

      <div className="relative flex w-full mb-6">
        <button 
          onClick={handleBackToRestaurant}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <span className="mr-1">←</span> Back to Restaurant
        </button>
        <h1 className="absolute left-[41%] text-3xl font-bold">Add Menu Items</h1>
      </div>

      <div className='flex flex-col justify-center items-center'>
        {menuForms.map((formIndex) => (
          <MenuItemForm
            key={formIndex}
            formIndex={formIndex}
            restaurantOptions={restaurants}
            onRemove={() => removeMenuItem(formIndex)}
            onFormChange={(data) => handleFormChange(formIndex, data)}
            initialData={menuItemsData[formIndex] || {}}
          />
        ))}
      </div>

      <div className='w-full flex flex-col justify-center items-center'>
        <div className="w-[55%]">
          <button 
              onClick={addMenuItem} 
              className="block w-12 h-12 float-right bg-[#8DB670] rounded-full hover:bg-[#6c8b55] justify-items-center"
              title="Add another item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <div className='flex flex-col justify-center items-center gap-6 mt-10'>
            <button
              onClick={handleAddAllItems}
              className="block w-full max-w-96 text-center bg-[#8DB670] rounded-xl pt-4 pb-4 font-semibold text-white mt-2 hover:bg-[#6c8b55]"
            >
              Add All Items
            </button>

            <button
              onClick={handleBackToRestaurant}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        
          
        </div>
      </div>
      
    </div>
  );
};

export default ManageMenuItems;