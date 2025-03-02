import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddRestaurant from './components/Restaurant/AddRestaurant';
import MenuItemForm from './components/Menu/MenuItemForm';
import ManageMenuItems from './components/Menu/ManageMenuItems';
import RestaurantPage from './components/Restaurant/RestaurantPage';
import RestaurantList from './components/Restaurant/RestaurantList';
import LandingPage from './components/General/LandingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm font-[Roboto_Flex] flex ml-5">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-3xl font-bold text-[#8DB670] m-4">SafeEats</Link>
          </div>
          <div className="ml-6 flex space-x-4 items-center">
            <Link to="/restaurant-list" className="text-gray-700 hover:text-[#6c8b55] px-3 py-2 rounded-md">
              Home
            </Link>
            <Link to="/add-restaurant" className="text-gray-700 hover:text-[#6c8b55] px-3 py-2 rounded-md">
              Add Restaurant
            </Link>
          </div>
        </nav>
        
        <main className="py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/restaurant-list" element={<RestaurantList />} />
            <Route path="/add-restaurant" element={<AddRestaurant />} />
            <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
            <Route path="/:restaurantId/add" element={<ManageMenuItems />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;