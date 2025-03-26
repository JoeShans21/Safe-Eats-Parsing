import React from 'react';
import { Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

const Header = ({ restaurantId }) => {
  return (
    <header className="bg-white shadow-md py-6 px-8">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link to={restaurantId ? `/restaurant/${restaurantId}` : '/'} className="font-bold text-xl text-[#8DB670]">
            SafeEats Restaurant
          </Link>
        </div>
        
        {/* Navigation links */}
        {restaurantId && (
          <nav className="hidden md:flex space-x-6">
            <Link 
              to={`/restaurant/${restaurantId}`} 
              className="text-gray-700 hover:text-[#8DB670]"
            >
              Dashboard
            </Link>
            <Link 
              to={`/restaurant/${restaurantId}/menu`} 
              className="text-gray-700 hover:text-[#8DB670]"
            >
              Menu
            </Link>
          </nav>
        )}
        
        {/* Profile Menu */}
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;