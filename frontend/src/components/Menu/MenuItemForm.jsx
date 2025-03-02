import React, { useState, useEffect, useRef } from 'react';

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

const MenuItemForm = ({ formIndex, onRemove, onFormChange, initialData = {}, restaurantOptions }) => {
  // Use a ref to track if this is the initial render
  const isFirstRender = useRef(true);
  
  // Deep compare function for objects
  const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  
  // Previous form data ref to prevent unnecessary updates
  const prevFormDataRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    allergens: [],
    dietaryCategories: [],
    ingredients: '',
    ...initialData
  });
  
  const [parsedAllergens, setParsedAllergens] = useState([]);
  const [parseError, setParseError] = useState('');

  // Effect to handle initialData updates from parent
  useEffect(() => {
    if (!isEqual(initialData, prevFormDataRef.current)) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
      prevFormDataRef.current = initialData;
    }
  }, [initialData]);

  // Notify parent component when form data changes, but only after initial render
  // and only when data actually changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only call onFormChange if data has actually changed and isn't empty
    if (onFormChange && !isEqual(formData, prevFormDataRef.current)) {
      prevFormDataRef.current = { ...formData };
      onFormChange(formData);
    }
  }, [formData, onFormChange]);

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
    <div className="p-6 border border-gray-300 rounded-md shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Menu Item #{formIndex + 1}</h2>
        <button 
          onClick={onRemove} 
          className="text-red-500 hover:text-red-700"
          type="button"
        >
          ❌ Remove
        </button>
      </div>
      
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

        {/* Ingredient Parsing */}
        <div>
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
        </div>

        {/* Allergens Section */}
        <div>
          <h3 className="font-medium mb-2">Allergens</h3>
          <div className="grid grid-cols-2 gap-2">
            {allergenOptions.map((allergen) => (
              <label key={allergen.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen.id)}
                  onChange={() => handleCheckboxChange('allergens', allergen.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{allergen.icon} {allergen.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dietary Categories */}
        <div>
          <h3 className="font-medium mb-2">Dietary Options</h3>
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;