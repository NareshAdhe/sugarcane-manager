import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// const API_URL = "https://sugarcane-manager-backend.onrender.com";
const API_URL = "http://10.145.211.171:3000";

const api = axios.create({
  baseURL: API_URL,
});

// Automatically add token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;