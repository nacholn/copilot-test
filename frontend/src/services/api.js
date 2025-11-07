import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions allow errors to propagate to component level
// where they can be handled with user-friendly messages

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default api;
