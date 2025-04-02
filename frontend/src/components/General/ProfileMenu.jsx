import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const ProfileMenu = ({ userName, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('auth_token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email') || '');
  const [displayName, setDisplayName] = useState(userName || localStorage.getItem('user_name') || '');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update from props if available
    if (userName) {
      setDisplayName(userName);
    }
    
    // Update based on authentication
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('email');
    setIsAuthenticated(!!token);
    setUserEmail(email || '');
    
    // Handle clicks outside the menu to close it
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userName]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsOpen(false); // Close menu immediately for better UX
      
      // Call API for logout
      await api.logoutUser();
      
      // Clear local state
      setIsAuthenticated(false);
      setUserEmail('');
      setDisplayName('');
      
      // Notify other components about auth change
      window.dispatchEvent(new CustomEvent('auth-change'));
      
      // Navigate to landing page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get the first letter of the user's name or email for avatar
  const getInitial = () => {
    if (displayName && displayName.length > 0) {
      return displayName.charAt(0).toUpperCase();
    }
    if (userEmail && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase();
    }
    return '?';
  };

  // If not authenticated, show login link
  if (!isAuthenticated) {
    return (
      <Link
        to="/"
        className="text-[#8DB670] font-semibold hover:underline"
      >
        Login
      </Link>
    );
  }

  // If authenticated, show profile menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-[#8DB670] flex items-center justify-center text-white font-semibold">
          {getInitial()}
        </div>
        <span className="ml-2 hidden md:block">
          {displayName || userEmail}
        </span>
        {isAdmin && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Admin
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {userEmail}
            </p>
          </div>
          
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          
          {isAdmin && (
            <Link
              to="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;