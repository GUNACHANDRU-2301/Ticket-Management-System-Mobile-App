import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tms_user');
    const savedToken = localStorage.getItem('tms_token');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token: jwtToken, role, username: userName, userId } = res.data;

      const userObj = { userId, username: userName, role };

      localStorage.setItem('tms_token', jwtToken);
      localStorage.setItem('tms_user', JSON.stringify(userObj));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

      setToken(jwtToken);
      setUser(userObj);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid login credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && ['SuperAdmin', 'Admin'].includes(user.role);
  const isSuperAdmin = user && user.role === 'SuperAdmin';
  const isUser = user && user.role === 'User';
  const isTechnician = user && !['SuperAdmin', 'Admin', 'User'].includes(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
        isUser,
        isTechnician
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
