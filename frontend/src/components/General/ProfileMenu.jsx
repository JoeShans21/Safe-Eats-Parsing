import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if auth token exists
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user data when component mounts
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await api.getCurrentUser();
        console.log("User data received:", userData); // Debug log
        
        if (userData && userData.email) {
          setUser(userData);
          setTokenValid(true);
        } else {
          // If no valid user data returned, token might be invalid
          console.warn("No valid user data returned, token might be expired");
          // Option: refresh token or clear invalid token
          // localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle specific error cases
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn("Authentication token invalid or expired");
          localStorage.removeItem('auth_token');
          setTokenValid(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return '?';
    
    // Use the first letter of the email
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
      localStorage.removeItem('auth_token');
      setUser(null);
      setTokenValid(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // Force logout even if API call fails
      localStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  // Only render the profile menu if auth token exists
  if (!localStorage.getItem('auth_token')) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-5 mb-5 w-10 h-10 rounded-full bg-[#8DB670] text-white flex items-center justify-center font-semibold focus:outline-none hover:bg-[#6c8b55]"
        aria-label="User profile menu"
      >
        {loading ? "..." : getUserInitials()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
          {loading ? (
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm">Loading...</p>
            </div>
          ) : user && user.email ? (
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold">{user.email}</p>
            </div>
          ) : (
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm text-red-500">
                {tokenValid ? "Email not available" : "Session expired. Please log in again."}
              </p>
            </div>
          )}
          
          <a 
            href="#" 
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              navigate('/profile');
            }}
          >
            My Profile
          </a>
          
          <a 
            href="#" 
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;