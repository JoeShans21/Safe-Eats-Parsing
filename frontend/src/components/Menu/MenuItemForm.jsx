import React, { useState } from 'react';

const MenuItemForm = ({ onRemove, onFormChange, restaurantOptions = [], formData = {} }) => {
  const handleChange = (key, value) => {
    onFormChange(key, value);
  };

  const handleCheckboxChange = (key, id) => {
    onFormChange(key, formData[key].includes(id)
      ? formData[key].filter((item) => item !== id)
      : [...formData[key], id]);
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md shadow-md relative">
      <button onClick={onRemove} className="absolute top-2 right-2 text-red-500">❌</button>
      <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
      <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default MenuItemForm;
