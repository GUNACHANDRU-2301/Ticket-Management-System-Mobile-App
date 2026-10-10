import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect the appropriate backend API URL
const getBaseUrl = () => {
  // If running in browser on computer
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // When running on physical device via Expo Go:
  // Extract the host computer's IP address dynamically from the Metro connection
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoClient?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:5000/api`;
      }
    }
  } catch (e) {
    console.warn('Could not auto-detect Expo hostUri:', e);
  }

  // Detected Local Wi-Fi Network IP of the computer
  return 'http://10.244.48.88:5000/api';
};

export const API_BASE_URL = getBaseUrl();

// Base server URL (without /api) for serving image uploads
export const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

console.log('🔗 Configured API_BASE_URL:', API_BASE_URL);
