import React, { useState } from 'react';

const MenuItemForm = ({ onRemove, onFormSubmit, restaurantOptions = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    restaurantId: '',
    allergens: [],
    dietaryCategories: []
  });

  const handleChange = (key, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };
      return updatedData;
    });
  };

  const handleCheckboxChange = (key, id) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [key]: prev[key].includes(id)
          ? prev[key].filter((item) => item !== id)
          : [...prev[key], id]
      };
      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData); // Submit the form data to parent when the form is completed
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md shadow-md relative">
      <button onClick={onRemove} className="absolute top-2 right-2 text-red-500">❌</button>
      <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {/* Add allergens and dietaryCategories logic here */}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">
          Save Item
        </button>
      </form>
    </div>
  );
};

export default MenuItemForm;