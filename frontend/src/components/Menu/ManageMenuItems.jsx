import React, { useState } from 'react';

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

const MenuItemForm = ({ onRemove, onFormSubmit, restaurantOptions = [] }) => {
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

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, id) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((item) => item !== id)
        : [...prev[key], id]
    }));
  };

  const parseIngredients = () => {
    if (!formData.ingredients.trim()) return;

    setParseError('');
    const ingredients = formData.ingredients.toLowerCase().split(',').map(item => item.trim());
    const foundAllergens = [];

    ingredients.forEach(ingredient => {
      allergenOptions.forEach(allergen => {
        if (ingredient.includes(allergen.label.toLowerCase()) && !foundAllergens.includes(allergen.id)) {
          foundAllergens.push(allergen.id);
        }
      });
    });

    setParsedAllergens(foundAllergens);
    setFormData((prev) => ({
      ...prev,
      allergens: [...new Set([...prev.allergens, ...foundAllergens])]
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-md shadow-md relative">
      <button onClick={onRemove} className="absolute top-2 right-2 text-red-500">❌</button>
      <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
      <form className="space-y-4">
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

        {/* Ingredient Parsing */}
        <textarea
          placeholder="Enter ingredients separated by commas"
          value={formData.ingredients}
          onChange={(e) => handleChange('ingredients', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="button"
          className={`mt-2 py-1 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.ingredients.trim() ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
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

        {/* Dietary Categories */}
        <div className="space-y-2">
          {dietaryCategories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.dietaryCategories.includes(category.id)}
                onChange={() => handleCheckboxChange('dietaryCategories', category.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{category.icon} {category.label}</span>
            </label>
          ))}
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;
