import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const AddRestaurant = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    cuisine_type: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createRestaurant(formData);
      const successMessage = 'Restaurant added successfully!';
      setSuccess(successMessage);
      await showToast(successMessage);
      setError('');
      setFormData({
        name: '',
        address: '',
        phone: '',
        cuisine_type: ''
      });
    } catch (error) {
      const errorMessage = 'Error creating restaurant';
      setError(errorMessage);
      await showToast(errorMessage);
      setSuccess('');
      console.error('Error creating restaurant:', error);
    }
  };

  return (
    <div className="w-auto p-6 font-[Roboto_Flex]">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <h2 className="text-3xl font-bold text-center mb-6">Add New Restaurant</h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col justify-center">
        {/* container for the two halves */}
        <div className='w-full flex justify-center gap-10'>
          {/* left column */}
          <div className="w-1/2 max-w-96 flex flex-col">
            <div>
              <label className='block text-lg'>Restaurant Name*</label>
              <input
                className="block mb-5 p-3 border border-gray-300 rounded-xl w-full"
                placeholder="Restaurant Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className='block text-lg'>Phone Number*</label>
              <input
                className="block mb-5 p-3 border border-gray-300 rounded-xl w-full"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          {/* right column */}
          <div className='w-1/2 max-w-96'>
            <div>
              <label className='block text-lg'>Address*</label>
              <input
                className="block mb-5 p-3 border border-gray-300 rounded-xl w-full"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className='block text-lg'>Cuisine Type*</label>
              <input
                className="block mb-5 p-3 border border-gray-300 rounded-xl w-full"
                placeholder="Cuisine Type"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
                required
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="mx-auto w-full max-w-96 text-center bg-[#8DB670] rounded-xl pt-2 pb-2 font-semibold text-white mt-2 hover:bg-[#6c8b55]"
        >
          Add Restaurant
        </button>
      </form>
    </div>
  );
};

export default AddRestaurant;