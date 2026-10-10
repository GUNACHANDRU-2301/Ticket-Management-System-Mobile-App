import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await loginApi(username, password);
      const userObj = {
        userId: data.userId,
        role: data.role,
        username: data.username
      };

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userObj));

      setUserToken(data.token);
      setUserInfo(userObj);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      const msg =
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED'
          ? 'Connection timed out. Check that phone is on the same Wi-Fi as your computer.'
          : error.message) ||
        'Login failed. Check server connection.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setUserToken(null);
    setUserInfo(null);
    setIsLoading(false);
  };

  const loadStorageData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const info = await AsyncStorage.getItem('userInfo');
      if (token && info) {
        setUserToken(token);
        setUserInfo(JSON.parse(info));
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  const isAdmin = ['SuperAdmin', 'Admin'].includes(userInfo?.role);
  const isSuperAdmin = userInfo?.role === 'SuperAdmin';
  const isUser = ['User', 'Users'].includes(userInfo?.role);
  const isTechnician = Boolean(userInfo?.role && !isAdmin && !isUser);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
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
