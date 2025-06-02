import { User } from '../types';

const API_BASE_URL = '/api';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  return handleResponse(response);
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
}; 