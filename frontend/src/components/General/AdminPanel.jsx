import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import UserManagement from './UserManagement';

const AdminPanel = () => {
  // State for all data that should persist between tab switches
  const [restaurants, setRestaurants] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Keep track of which data has been loaded already
  const [dataLoaded, setDataLoaded] = useState({
    restaurants: false,
    userCount: false
  });

  // Load restaurant data only once on component mount or if not loaded yet
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (dataLoaded.restaurants) return;
      
      try {
        setLoadingRestaurants(true);
        setError('');
        
        const restaurantsData = await api.getRestaurants();
        setRestaurants(restaurantsData);
        
        // Mark restaurants as loaded
        setDataLoaded(prev => ({ ...prev, restaurants: true }));
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to load restaurant data');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    
    fetchRestaurants();
  }, [dataLoaded.restaurants]);

  // Load user count data if on overview tab and not loaded yet
  useEffect(() => {
    const fetchUserCount = async () => {
      if (dataLoaded.userCount || activeTab !== 'overview') return;
      
      try {
        setLoadingUsers(true);
        
        const usersData = await api.getAllUsers();
        setUserCount(usersData.length);
        
        // Mark user count as loaded
        setDataLoaded(prev => ({ ...prev, userCount: true }));
      } catch (error) {
        console.error('Error fetching user count:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUserCount();
  }, [activeTab, dataLoaded.userCount]);
  
  // Force refresh all data
  const handleRefreshAll = async () => {
    setDataLoaded({
      restaurants: false,
      userCount: false
    });
  };

  // Switch tabs with smooth transitions
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleRefreshAll}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh All Data
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange('users')}
              >
                User Management
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'restaurants'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange('restaurants')}
              >
                Restaurants
              </button>
            </li>
          </ul>
        </div>
        
        {/* Tab Content with transition */}
        <div className="transition-opacity duration-150 ease-in-out">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <p className="mb-4">Welcome to the admin panel. Here you can manage users and restaurants.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h2 className="text-lg font-semibold mb-2">Restaurants</h2>
                  {loadingRestaurants ? (
                    <div className="h-8 flex items-center">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full mr-2"></div>
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-blue-600">{restaurants.length}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-4">Total restaurants in the system</p>
                  <Link 
                    to="/restaurant-list"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View All Restaurants
                  </Link>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h2 className="text-lg font-semibold mb-2">Users</h2>
                  {loadingUsers ? (
                    <div className="h-8 flex items-center">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{userCount}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-4">Registered users</p>
                  <button 
                    onClick={() => handleTabChange('users')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Users Tab - the component maintains its own state */}
          {activeTab === 'users' && (
            <div className="opacity-100">
              <UserManagement />
            </div>
          )}
          
          {/* Restaurants Tab */}
          {activeTab === 'restaurants' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Restaurant Management</h2>
                <button 
                  onClick={() => setDataLoaded(prev => ({ ...prev, restaurants: false }))}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {loadingRestaurants ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {restaurants.length > 0 ? (
                          restaurants.map(restaurant => (
                            <tr key={restaurant.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                {restaurant.name}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                {restaurant.cuisine_type}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[180px]">
                                {restaurant.address}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                {restaurant.phone}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap text-center text-sm font-medium">
                                <Link 
                                  to={`/restaurant/${restaurant.id}`} 
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition"
                                >
                                  View Details
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">
                              No restaurants found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Restaurant Count */}
                  <div className="mt-4 text-sm text-gray-500">
                    Showing {restaurants.length} restaurants
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;