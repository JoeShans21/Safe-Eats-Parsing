import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MenuItemForm from './components/Menu/MenuItemForm';
import ManageMenuItems from './components/Menu/ManageMenuItems';
import RestaurantPage from './components/Restaurant/RestaurantPage';
import RestaurantList from './components/Restaurant/RestaurantList';
import LandingPage from './components/General/LandingPage';
import RegisterRestaurant from './components/Restaurant/RegisterRestaurant';
import ProfileMenu from './components/General/ProfileMenu';
import ProfilePage from './components/General/ProfilePage';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm font-[Roboto_Flex] flex justify-between pl-6 pr-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-3xl font-bold text-[#8DB670] m-4">SafeEats</div>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
            <Link to="/restaurant-list" className="text-gray-700 hover:text-[#6c8b55] px-3 py-2 rounded-md">
                Dashboard
              </Link>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
              <Link to="/restaurant-list" className="text-gray-700 hover:text-[#6c8b55] px-3 py-2 rounded-md">
                View All Restaurants
              </Link>
            </div>
          </div>
          
          {/* Profile Menu added here */}
          <div className="flex items-center">
            <ProfileMenu />
          </div>
        </nav>
        
        <main className="py-6">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<RegisterRestaurant />} />
            <Route path="/restaurant-list" element={<RestaurantList />} />
            
            {/* Protected routes */}
            <Route 
              path="/profile" 
              element={<ProtectedRoute element={<ProfilePage />} />} 
            />
            <Route 
              path="/restaurant/:restaurantId" 
              element={<ProtectedRoute element={<RestaurantPage />} />} 
            />
            <Route 
              path="/:restaurantId/add" 
              element={<ProtectedRoute element={<ManageMenuItems />} />} 
            />
            <Route 
              path="/add-restaurant" 
              element={<ProtectedRoute element={<RegisterRestaurant />} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;