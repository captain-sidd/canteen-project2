import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = "http://192.168.0.149:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    } catch (error) {
      console.error('[API REQUEST ERROR] fetching token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config ? error.config.url : 'Unknown URL';
    const errorData = error.response?.data || error.message;

    console.error(`[API ERROR] ${url} - Status: ${status}`, errorData);

    if (status === 401) {
      // Unauthorized: Usually means token expired
      Alert.alert('Session Expired', 'Please log in again to continue enjoying your meals.', [
        { text: 'OK' }
        // Note: Actual redirection to Login should be handled at the App Navigation level if needed,
        // or through a global event emitter.
      ]);
    } else if (status === 403) {
      // Forbidden
      Alert.alert('Access Denied', 'You do not have permission to perform this action.');
    } else if (status === 404) {
      // Not Found
      // Suppress 404 alerts for typical resource lookups to prevent spam, or handle them gracefully
      console.warn(`[API WARNING] Resource not found: ${url}`);
    } else if (status === 500) {
      // Server Error
      Alert.alert('Server Error', 'Our kitchen is experiencing some technical difficulties. Please try again later.');
    } else if (!error.response) {
      // Network Error
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    }

    return Promise.reject(error);
  }
);

// Reusable API Methods
export const apiService = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url),
};

export default api;
