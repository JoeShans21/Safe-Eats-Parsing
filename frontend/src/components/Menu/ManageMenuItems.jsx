import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get restaurantId from URL
import { api } from '../../services/api';
import MenuItemForm from './MenuItemForm';

const ManageMenuItems = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuForms, setMenuForms] = useState([1]); // Keep track of multiple forms
  const [menuItemsData, setMenuItemsData] = useState([]); // Holds the data from all form inputs
  const { restaurantId } = useParams();  // Get restaurantId from URL

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.getRestaurants();
        setRestaurants(response);
      } catch {
        console.error("Failed to fetch restaurants");
      }
    };
    fetchRestaurants();
  }, []);

  const addMenuItem = () => setMenuForms([...menuForms, menuForms.length + 1]);
  const removeMenuItem = (index) => setMenuForms(menuForms.filter((_, i) => i !== index));

  // Collect form data when the form is submitted (rather than on each change)
  const handleFormSubmit = (index, data) => {
    setMenuItemsData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = data; // Update the specific form's data
      return updatedData;
    });
  };

  // Handle the submission of all items at once
  const handleAddAllItems = async () => {
    if (!restaurantId) {
      alert('Restaurant ID is missing!');
      return;
    }

    try {
      // Assuming restaurantId and menuItemsData are properly set
      console.log('Adding menu items:', menuItemsData);
  
      // Use Promise.all to send all requests in parallel
      const addItemPromises = menuItemsData.map((itemData) =>
        api.addMenuItem(restaurantId, itemData)
      );
  
      // Wait for all the promises to resolve
      await Promise.all(addItemPromises);
  
      alert('All menu items added successfully!');
      setMenuForms([1]); // Reset forms after submission
      setMenuItemsData([]); // Clear the collected data
    } catch (error) {
      console.error('Failed to add menu items', error);
      alert('Error adding menu items.');
    }
  };

  return (
    <div className="space-y-6">
      {menuForms.map((_, index) => (
        <MenuItemForm
          key={index}
          restaurantOptions={restaurants}
          onRemove={() => removeMenuItem(index)}
          onFormSubmit={(data) => handleFormSubmit(index, data)} // Submit form data when form is submitted
        />
      ))}
      <button onClick={addMenuItem} className="bg-green-500 text-white py-2 px-4 rounded-md">
        ➕ Add Another Item
      </button>

      <button
        onClick={handleAddAllItems} // Add all items at once
        className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
      >
        ✅ Add All Items
      </button>
    </div>
  );
};

export default ManageMenuItems;
