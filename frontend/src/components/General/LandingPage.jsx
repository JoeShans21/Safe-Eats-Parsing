import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Debug the auth state
        api.debugAuthState();
        
        const user = await api.getCurrentUser();
        console.log('Current user:', user);
        
        if (user) {
          // If user has a restaurant, navigate to it
          if (user.restaurantId) {
            navigate(`/restaurant/${user.restaurantId}`);
          } else {
            // Otherwise navigate to add restaurant page
            navigate('/restaurant/add');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Don't show error to user on initial load
      }
    };

    checkAuth();
  }, [navigate]);

  const showToast = async (message) => {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  // Handles login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      console.log('Starting login process...');
      const response = await api.loginUser(formData.email, formData.password);
      console.log('Login response:', response);
      
      setSuccess('Login successful!');
      await showToast('Login successful!');
      
      // Debug the auth state after login
      api.debugAuthState();
      
      // Wait a moment to ensure token is stored before navigating
      setTimeout(() => {
        // If user has a restaurant, navigate to it
        if (response.restaurantId) {
          navigate(`/restaurant/${response.restaurantId}`);
        } else {
          // Otherwise navigate to add restaurant page
          navigate('/restaurant/add');
        }
      }, 300);
    } catch (error) {
      setError(error.message || 'Login failed');
      await showToast(error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to signup page - pass form data
  const handleSignupClick = (e) => {
    e.preventDefault();
    // Navigate to signup page with current email and password as state
    navigate('/signup', { state: { email: formData.email, password: formData.password } });
  };

  return (
    <div className="w-full p-6 font-[Roboto_Flex]">
      <h1 className="text-3xl font-bold text-center">Welcome to SafeEats Manager!</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <div className="flex flex-col items-center justify-center mt-10">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-lg mb-2">Email</label>
              <input 
                type="email"
                placeholder="Enter your email" 
                className="w-full p-3 border border-gray-300 rounded-xl"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-lg mb-2">Password</label>
              <input 
                type="password"
                placeholder="Enter your password" 
                className="w-full p-3 border border-gray-300 rounded-xl"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full text-center bg-[#8DB670] rounded-xl py-3 font-semibold text-white hover:bg-[#6c8b55] disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p>Don't have an account?</p>
            <button 
              onClick={handleSignupClick}
              className="text-[#8DB670] font-semibold hover:underline inline-block mt-2"
            >
              Register a New Restaurant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;