import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  return 'http://192.168.29.251:5000/api';
};

export const API_BASE_URL = getBaseUrl();
export const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');