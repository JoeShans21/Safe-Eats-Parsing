import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { api } from '../../services/api';

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize form data with any values passed from the landing page
  const [userData, setUserData] = useState({
    name: '',  // Added name field
    email: location.state?.email || '',
    password: location.state?.password || '',
    confirmPassword: ''
  });
  
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    address: '',
    phone: '',
    cuisine_type: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Account details, 2 = Restaurant details

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const user = await api.getCurrentUser();
        console.log("Current user:", user);
        
        if (user) {
          if (user.restaurantId) {
            console.log("User has restaurant, redirecting to:", `/restaurant/${user.restaurantId}`);
            navigate(`/restaurant/${user.restaurantId}`);
          } else {
            // User exists but no restaurant, go to step 2
            console.log("User exists but no restaurant, setting step to 2");
            setStep(2);
          }
        } else {
          console.log("No authenticated user found");
        }
      } catch (error) {
        console.error('Auth check error:', error);
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

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name field
    if (!userData.name.trim()) {
      setError('Please enter your name');
      await showToast('Please enter your name');
      return;
    }
    
    // Password validation
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      await showToast('Passwords do not match');
      return;
    }
    
    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters');
      await showToast('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log("Registering user with data:", { 
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      
      // Register the user
      const userResponse = await api.registerUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        restaurantName: '' // Will be set later
      });
      
      console.log("Registration response:", userResponse);
      
      setSuccess('Account created! Now let\'s add your restaurant details.');
      await showToast('Account created successfully!');
      
      // Move to restaurant creation step
      setStep(2);
    } catch (error) {
      setError(error.message || 'Registration failed');
      await showToast(error.message || 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log("Creating restaurant with data:", restaurantData);
      
      // Create the restaurant
      const response = await api.createRestaurant(restaurantData);
      
      console.log("Restaurant creation response:", response);
      
      setSuccess('Restaurant registered successfully!');
      await showToast('Restaurant registered successfully!');
      
      // Navigate to the restaurant page - add small delay to ensure data is updated
      setTimeout(() => {
        navigate(`/restaurant/${response.id}`);
      }, 500);
    } catch (error) {
      setError(error.message || 'Failed to create restaurant');
      await showToast(error.message || 'Failed to create restaurant');
      console.error('Error creating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 font-[Roboto_Flex]">
      <h1 className="text-3xl font-bold text-center">Register Your Restaurant</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <div className="flex flex-col items-center justify-center mt-10">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md">
          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className={`flex items-center ${step >= 1 ? 'text-[#8DB670]' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-[#8DB670] bg-[#8DB670] text-white' : 'border-gray-400'}`}>
                1
              </div>
              <div className="ml-2">Account</div>
            </div>
            <div className={`mx-4 border-t-2 w-16 mt-4 ${step >= 2 ? 'border-[#8DB670]' : 'border-gray-400'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-[#8DB670]' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-[#8DB670] bg-[#8DB670] text-white' : 'border-gray-400'}`}>
                2
              </div>
              <div className="ml-2">Restaurant</div>
            </div>
          </div>
          
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
              <form onSubmit={handleUserSubmit}>
                {/* Name field */}
                <div className="mb-4">
                  <label className="block text-lg mb-2">Name*</label>
                  <input 
                    type="text"
                    placeholder="Enter your full name" 
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-lg mb-2">Email*</label>
                  <input 
                    type="email"
                    placeholder="Enter your email" 
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-lg mb-2">Password*</label>
                  <input 
                    type="password"
                    placeholder="Create a password" 
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-lg mb-2">Confirm Password*</label>
                  <input 
                    type="password"
                    placeholder="Confirm your password" 
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    value={userData.confirmPassword}
                    onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-center bg-[#8DB670] rounded-xl py-3 font-semibold text-white hover:bg-[#6c8b55] disabled:bg-gray-400"
                >
                  {loading ? 'Creating Account...' : 'Continue to Restaurant Details'}
                </button>
                
                <div className="mt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:underline"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            </>
          )}
          
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Restaurant Details</h2>
              <form onSubmit={handleRestaurantSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg mb-2">Restaurant Name*</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-xl"
                      placeholder="Restaurant Name"
                      value={restaurantData.name}
                      onChange={(e) => setRestaurantData({...restaurantData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg mb-2">Phone Number*</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-xl"
                      placeholder="Phone"
                      value={restaurantData.phone}
                      onChange={(e) => setRestaurantData({...restaurantData, phone: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg mb-2">Address*</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-xl"
                      placeholder="Address"
                      value={restaurantData.address}
                      onChange={(e) => setRestaurantData({...restaurantData, address: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg mb-2">Cuisine Type*</label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-xl"
                      placeholder="Cuisine Type"
                      value={restaurantData.cuisine_type}
                      onChange={(e) => setRestaurantData({...restaurantData, cuisine_type: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-center bg-[#8DB670] rounded-xl py-3 font-semibold text-white hover:bg-[#6c8b55] disabled:bg-gray-400"
                  >
                    {loading ? 'Registering Restaurant...' : 'Register Restaurant'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterRestaurant;