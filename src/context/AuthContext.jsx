import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const signup = async (userData) => {
    const user = await authService.signup(userData);
    setCurrentUser(user);
    return user;
  };

  const loginAsAdminDemo = async () => {
    const user = await authService.createDemoAccount('admin');
    setCurrentUser(user);
    return user;
  };

  const loginAsVoterDemo = async () => {
    const user = await authService.createDemoAccount('voter');
    setCurrentUser(user);
    return user;
  };

  const updateProfile = (userId, data) => {
    const updated = authService.updateProfile(userId, data, currentUser);
    if (updated) {
      setCurrentUser(updated);
    }
    return updated;
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentUser) throw new Error('Not authenticated.');
    await authService.changePassword({
      userId: currentUser.id,
      currentPassword,
      newPassword,
      confirmPassword,
      isAdminBypass: false,
      actorUser: currentUser
    });
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    isAdmin: currentUser?.role === 'admin',
    isVoter: currentUser?.role === 'voter',
    login,
    signup,
    loginAsAdminDemo,
    loginAsVoterDemo,
    updateProfile,
    changePassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
