import axios from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions allow errors to propagate to component level
// where they can be handled with user-friendly messages

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/users', userData);
  return response.data.data;
};

export const updateUser = async (id: number, userData: Partial<Omit<User, 'id'>>): Promise<User> => {
  const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  return response.data;
};

export default api;
