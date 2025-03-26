import React, { useState, useEffect, useRef } from 'react';

const allergenOptions = [
  { id: 'milk', label: 'Milk', icon: '🥛' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'tree_nuts', label: 'Tree Nuts', icon: '🌰' },
  { id: 'wheat', label: 'Wheat', icon: '🌾' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦀' },
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
    price: '$0.00',
    priceNumeric: 0, // Numeric value for price calculations
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
      // Format price if present in initialData
      let formattedInitialData = { ...initialData };
      
      if (initialData.price !== undefined) {
        // If the price is already a number, format it accordingly
        let priceValue = initialData.price;
        
        // Handle if the price is already a string with a $ sign
        if (typeof priceValue === 'string' && priceValue.includes('$')) {
          priceValue = priceValue.replace(/[^\d.]/g, '');
        }
        
        // Convert to number if needed
        if (typeof priceValue !== 'number') {
          priceValue = parseFloat(priceValue);
        }
        
        // Store the numeric value
        formattedInitialData.priceNumeric = priceValue;
        
        // Format for display with $ sign
        if (!isNaN(priceValue)) {
          // Convert to cents (multiply by 100 and round to avoid floating-point issues)
          const cents = Math.round(priceValue * 100);
          const priceDigits = cents.toString();
          
          if (priceDigits.length === 0 || cents === 0) {
            formattedInitialData.price = '$0.00';
          } else if (priceDigits.length === 1) {
            formattedInitialData.price = `$0.0${priceDigits}`;
          } else if (priceDigits.length === 2) {
            formattedInitialData.price = `$0.${priceDigits}`;
          } else {
            const dollars = priceDigits.slice(0, -2);
            const centsPart = priceDigits.slice(-2);
            const dollarsFormatted = Number(dollars).toString();
            formattedInitialData.price = `$${dollarsFormatted}.${centsPart}`;
          }
        } else {
          formattedInitialData.price = '$0.00';
        }
      } else {
        // If no price is provided, set a default
        formattedInitialData.price = '$0.00';
        formattedInitialData.priceNumeric = 0;
      }
      
      setFormData(prev => ({
        ...prev,
        ...formattedInitialData
      }));
      prevFormDataRef.current = formattedInitialData;
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
      
      // Create a data object to send to parent, with price as a number
      const dataForParent = { ...formData };
      
      // If we have a numeric price, use that for data sent to parent
      if (formData.priceNumeric !== undefined) {
        dataForParent.price = formData.priceNumeric;
      }
      
      onFormChange(dataForParent);
    }
  }, [formData, onFormChange]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle price input with automatic decimal formatting
  const handlePriceChange = (e) => {
    // Get current cursor position
    const cursorPosition = e.target.selectionStart;
    const input = e.target.value;
    
    // Remove any non-digits and dollar signs
    const digitsOnly = input.replace(/[^\d]/g, '');
    
    // Format with decimal point and dollar sign
    let formattedDisplay = '';
    let numericValue = 0;
    
    if (digitsOnly.length === 0) {
      formattedDisplay = '$0.00';
      numericValue = 0;
    } else if (digitsOnly.length === 1) {
      numericValue = parseFloat(`0.0${digitsOnly}`);
      formattedDisplay = `$0.0${digitsOnly}`;
    } else if (digitsOnly.length === 2) {
      numericValue = parseFloat(`0.${digitsOnly}`);
      formattedDisplay = `$0.${digitsOnly}`;
    } else {
      const dollars = digitsOnly.slice(0, -2);
      const cents = digitsOnly.slice(-2);
      // Convert to number and back to string to remove leading zeros
      const dollarsFormatted = Number(dollars).toString();
      numericValue = parseFloat(`${dollarsFormatted}.${cents}`);
      formattedDisplay = `$${dollarsFormatted}.${cents}`;
    }
    
    // Store both the display value and numeric value
    setFormData(prev => ({
      ...prev,
      price: formattedDisplay,
      priceNumeric: numericValue
    }));
    
    // Set cursor position after update (in a setTimeout to ensure DOM is updated)
    setTimeout(() => {
      if (e.target) {
        // Calculate new cursor position, accounting for the $ sign
        const newPosition = cursorPosition + (formattedDisplay.length - input.length);
        // Make sure cursor position is valid
        const validPosition = Math.max(1, Math.min(newPosition, formattedDisplay.length));
        e.target.setSelectionRange(validPosition, validPosition);
      }
    }, 0);
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
    <div className="mb-6 p-6 border border-gray-300 rounded-md shadow-md w-2xl">
      {/* "header" */}
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

        <div className='flex'>
          <label className='block font-medium text-lg whitespace-nowrap'>Item Name*</label>
          <input
            type="text"
            placeholder="Item Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="w-4/5 px-3 py-2 border border-gray-300 rounded-md ml-auto"
          />
        </div>
        
        <div className='flex items-start'>
          <label className='block font-medium text-lg whitespace-nowrap mr-5'>Description*</label>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            className="w-4/5 px-3 py-2 border border-gray-300 rounded-md ml-auto"
          />
        </div>

        {/* Ingredient Parsing */}
        <div>
          <div className='flex items-start'>
            <label className='block font-medium text-lg whitespace-nowrap mr-6'>Ingredients</label>
            <textarea
              placeholder="Enter ingredients separated by commas"
              value={formData.ingredients}
              onChange={(e) => handleChange('ingredients', e.target.value)}
              className="w-4/5 px-3 py-2 border border-gray-300 rounded-md ml-auto"
            />
          </div>
          
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

        {/* Container for the bottom */}
        <div className='flex justify-between'>


          {/* TODO: PUT THE IMAGE FIELD HERE */}


          {/* Container for price and dietary category */}
          <div className=''>
            {/* Price */}
            <div className='mb-3'>
              <label className='block font-medium text-lg whitespace-nowrap'>Price*</label>
              <input
                type="text"
                placeholder="Price"
                value={formData.price || '$0.00'}
                onChange={handlePriceChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            

            {/* Dietary Categories */}
            <div>
              <label className="font-medium mb-2">Dietary Options</label>
              <div className="">
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
          

          {/* Allergens Section */}
          <div>
            <label className="font-medium mb-2">Allergens</label>
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
          
        </div> {/* end of bottom half */}

      </div>
    </div>
  );
};

export default MenuItemForm;