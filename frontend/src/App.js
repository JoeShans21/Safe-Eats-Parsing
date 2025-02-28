import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddRestaurant from './components/Restaurant/AddRestaurant';
import AddMenuItem from './components/Menu/AddMenuItem';
import RestaurantPage from './components/Restaurant/RestaurantPage';
import RestaurantList from './components/Restaurant/RestaurantList';
import LandingPage from './components/General/LandingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  {/* <span className="text-xl font-bold text-blue-600">SafeEats</span> */}
                  <Link to="/" className="text-xl font-bold text-blue-600">SafeEats</Link>
                </div>
                <div className="ml-6 flex space-x-4 items-center">
                  <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Home
                  </Link>
                  <Link to="/add-restaurant" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Add Restaurant
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/add-restaurant" element={<AddRestaurant />} />
            <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
            <Route path="/menu/:restaurantId" element={<AddMenuItem />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;