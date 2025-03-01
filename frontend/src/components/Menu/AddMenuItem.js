import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const AddMenuItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    restaurantId: '',
    allergens: [],
    dietaryCategories: [],
    ingredients: ''
  });
  const [parsedAllergens, setParsedAllergens] = useState([]);
  const [parseError, setParseError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.getRestaurants();
        setRestaurants(response);
        setLoading(false);
      } catch (error) {
        setError('Failed to load restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  const handleAllergenChange = (allergenId) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }));
  };

  const handleDietaryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      dietaryCategories: prev.dietaryCategories.includes(categoryId)
        ? prev.dietaryCategories.filter(id => id !== categoryId)
        : [...prev.dietaryCategories, categoryId]
    }));
  };

  const parseIngredients = () => {
    if (!formData.ingredients.trim()) {
      return;
    }
    
    setParseError('');
    const ingredients = formData.ingredients.toLowerCase().split(',').map(item => item.trim());
    const foundAllergens = [];
    
    ingredients.forEach(ingredient => {
      allergenOptions.forEach(allergen => {
        if (ingredient.includes(allergen.label.toLowerCase())) {
          if (!foundAllergens.includes(allergen.id)) {
            foundAllergens.push(allergen.id);
          }
        }
      });
    });
    
    setParsedAllergens(foundAllergens);
    
    setFormData(prev => ({
      ...prev,
      allergens: [...new Set([...prev.allergens, ...foundAllergens])]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      if (!formData.restaurantId) {
        throw new Error('Please select a restaurant');
      }
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid positive price');
      }
  
      const menuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        allergens: formData.allergens,
        dietaryCategories: formData.dietaryCategories
      };
      
      const response = await api.addMenuItem(formData.restaurantId, menuItemData);
      const successMessage = 'Menu item added successfully!';
      setSuccess(successMessage);
      await showToast(successMessage);
      
      setFormData({
        name: '',
        description: '',
        price: '',
        restaurantId: '',
        allergens: [],
        dietaryCategories: [],
        ingredients: ''
      });
      setParsedAllergens([]);
      setParseError('');
    } catch (error) {
      const errorMessage = error.message || 'Error adding menu item';
      setError(errorMessage);
      await showToast(errorMessage);
      console.error('Error adding menu item:', error);
    }
  };

  if (loading) {
    return <div className="max-w-md mx-auto p-6">Loading restaurants...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <h2 className="text-2xl font-bold mb-6">Add Menu Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.restaurantId}
            onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
            required
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>

        {/* New Ingredient Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Input</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ingredients separated by commas"
            value={formData.ingredients}
            onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
            rows={2}
          />
          <button
            type="button"
            className={`mt-2 py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.ingredients.trim() 
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={parseIngredients}
            disabled={!formData.ingredients.trim()}
          >
            Parse
          </button>
          <div className="mt-2 text-sm">
            {parseError ? (
              <span className="text-red-600">{parseError}</span>
            ) : (
              <div>
                <span>Parsed allergens: </span>
                {parsedAllergens.length > 0 ? (
                  <span className="font-medium">
                    {parsedAllergens.map(id => {
                      const allergen = allergenOptions.find(a => a.id === id);
                      return allergen ? `${allergen.icon} ${allergen.label} ` : '';
                    })}
                  </span>
                ) : (
                  <span className="text-gray-500">None detected</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Categories</label>
          <div className="space-y-2">
            {dietaryCategories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.dietaryCategories.includes(category.id)}
                  onChange={() => handleDietaryChange(category.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{category.icon} {category.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
          <div className="grid grid-cols-2 gap-2">
            {allergenOptions.map((allergen) => (
              <label key={allergen.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen.id)}
                  onChange={() => handleAllergenChange(allergen.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{allergen.icon} {allergen.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Menu Item
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;