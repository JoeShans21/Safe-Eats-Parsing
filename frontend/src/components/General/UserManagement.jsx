import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  
  // Add state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Create a memoized fetchUsers function to avoid recreation on each render
  const fetchUsers = useCallback(async (force = false) => {
    // Skip if data already fetched and not forcing refresh
    if (dataFetched && !force) return;
    
    try {
      setLoading(true);
      setError('');
      const userData = await api.getAllUsers();
      setUsers(userData);
      setDataFetched(true);
    } catch (error) {
      setError('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [dataFetched]);

  // Get current user information only once
  useEffect(() => {
    const getCurrentUserEmail = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    
    if (!currentUserEmail) {
      getCurrentUserEmail();
    }
  }, [currentUserEmail]);

  // Fetch users if not already loaded
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Show confirmation before making admin
  const confirmMakeAdmin = (email, userId) => {
    setPendingAction({
      type: 'makeAdmin',
      email,
      userId
    });
    setShowConfirmModal(true);
  };

  // Show confirmation before removing admin
  const confirmRemoveAdmin = (email, userId) => {
    // Cannot remove your own admin privileges
    if (email === currentUserEmail) {
      setError("You cannot remove your own admin privileges");
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    
    setPendingAction({
      type: 'removeAdmin',
      email,
      userId
    });
    setShowConfirmModal(true);
  };

  // Execute the pending action after confirmation
  const executePendingAction = async () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'makeAdmin') {
      await handleMakeAdmin(pendingAction.email, pendingAction.userId);
    } else if (pendingAction.type === 'removeAdmin') {
      await handleRemoveAdmin(pendingAction.email, pendingAction.userId);
    }
    
    // Reset modal state
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  // Cancel the pending action
  const cancelPendingAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleMakeAdmin = async (email, userId) => {
    try {
      // Set loading state for this specific user
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      setError('');
      setSuccess('');
      
      // Make API call to update user role
      const response = await api.makeUserAdminByEmail(email);
      
      // Update local state without refetching all users
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.email === email) {
            return { ...user, is_admin: true };
          }
          return user;
        })
      );
      
      setSuccess(response.message || `User ${email} is now an admin`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to update user role');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleRemoveAdmin = async (email, userId) => {
    try {
      // Set loading state for this specific user
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      setError('');
      setSuccess('');
      
      // Make API call to update user role
      const response = await api.removeUserAdmin(email);
      
      // Update local state without refetching all users
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.email === email) {
            return { ...user, is_admin: false };
          }
          return user;
        })
      );
      
      setSuccess(response.message || `Admin privileges removed from ${email}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to update user role');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) ||
      (user.name && user.name.toLowerCase().includes(lowerSearchTerm)) ||
      (user.restaurant_name && user.restaurant_name.toLowerCase().includes(lowerSearchTerm))
    );
  });

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Component for the loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8DB670]"></div>
    </div>
  );

  // Handle refresh with clean loading state
  const handleRefresh = () => {
    fetchUsers(true); // Force refresh
  };

  // Get the user name for display in the confirmation modal
  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.name || email;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={handleRefresh}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-t-2 border-gray-500 border-r-2 rounded-full mr-1"></div>
              Refreshing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 transition-opacity duration-300">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 transition-opacity duration-300">
          {success}
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search users by name, email, or restaurant..."
          className="w-full p-2 pl-10 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* User Table with Loading State */}
      {loading && !users.length ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 mr-3 bg-[#8DB670] rounded-full flex items-center justify-center text-white">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {user.name || 'No name'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[180px]">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[150px]">
                      {user.restaurant_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center text-sm font-medium">
                      {/* Show either "Make Admin" or "Remove Admin" button based on current status */}
                      {!user.is_admin ? (
                        <button
                          onClick={() => confirmMakeAdmin(user.email, user.uid)}
                          disabled={actionLoading[user.uid]}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition"
                        >
                          {actionLoading[user.uid] ? (
                            <div className="inline-flex items-center">
                              <div className="animate-spin h-3 w-3 border-t-2 border-blue-500 border-r-2 rounded-full mr-1"></div>
                              Processing...
                            </div>
                          ) : (
                            'Make Admin'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => confirmRemoveAdmin(user.email, user.uid)}
                          disabled={actionLoading[user.uid] || user.email === currentUserEmail}
                          className={`px-2 py-1 rounded transition ${
                            user.email === currentUserEmail
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100'
                          }`}
                          title={user.email === currentUserEmail ? "You cannot remove your own admin privileges" : ""}
                        >
                          {actionLoading[user.uid] ? (
                            <div className="inline-flex items-center">
                              <div className="animate-spin h-3 w-3 border-t-2 border-red-500 border-r-2 rounded-full mr-1"></div>
                              Processing...
                            </div>
                          ) : (
                            'Remove Admin'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* User Count */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {pendingAction.type === 'makeAdmin' 
                ? 'Confirm Admin Role' 
                : 'Confirm Remove Admin Role'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pendingAction.type === 'makeAdmin'
                ? `Are you sure you want to make ${getUserName(pendingAction.email)} an admin? They will have full access to system settings.`
                : `Are you sure you want to remove admin privileges from ${getUserName(pendingAction.email)}?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelPendingAction}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executePendingAction}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  pendingAction.type === 'makeAdmin'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;