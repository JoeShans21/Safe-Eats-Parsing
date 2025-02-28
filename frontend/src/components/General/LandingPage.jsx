import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const LandingPage = () => {
  const [formData, setFormData] = useState({
      resName: '',
      email: ''
    });

  // handles new registrations
  const submitRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // TODO 
  }

  // handles given code
  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // TODO 
    // take the user to /restaurant/:restaurantId
    // should we check if the page exists first? like catch a 404 error?
  }

  return (
    <div className="w-full p-6 font-[Roboto_Flex]">
      <h1 className="text-3xl font-bold text-center">Welcome to SafeEats Restaurant!</h1>

      {/* container for the two sections */}
      <div className='flex gap-20 justify-center m-8'>
        {/* box 1 */}
        <div className='border rounded-xl p-5'>
          <h2 className='font-bold text-2xl mb-2'>Register a New Restaurant</h2>
          <form onSubmit={submitRegistration} className=''>
            <label className='block text-lg'>Restaurant Name</label>
            <input 
              placeholder='Enter your restaurant&#39;s name' 
              className='block mb-5 p-3 border rounded-xl w-full'
              onChange={(e) => setFormData({...formData, resName: e.target.value})}
              required
            />
            <label className='block text-lg'>Email</label>
            <input 
              placeholder='Enter your restaurant&#39;s email' 
              className='block mb-5 p-3 border rounded-xl w-full'
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <button
              type="submit"
              className="w-full text-center bg-[#8DB670] rounded-xl pt-2 pb-2 font-semibold text-white mt-2 hover:bg-[#6c8b55]"
            >
              Register
            </button>
          </form>
        </div>

        {/* box 2 */}
        <div className='border rounded-xl p-5'>
          <h2 className='font-bold text-2xl mb-[20%]'>View an Existing Restaurant</h2>
          <form onSubmit={submitCode} className=''>
            <label className='block text-lg text-center'>
              Enter your restaurant's unique code:
            </label>
            <input 
              placeholder='Enter your restaurant&#39;s unique code' 
              className='block mb-[20%] p-3 border rounded-xl w-full text-center'
              onChange={(e) => setFormData({...formData, email: e.target.value})} // needs to be changed
              required
            />
            <button
              type="submit"
              className="w-full text-center bg-[#8DB670] rounded-xl pt-2 pb-2 font-semibold text-white mt-2 hover:bg-[#6c8b55]"
            >
              View Restaurant
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default LandingPage;