import { request } from '../utils/apiClient';

export const loginUser = async (credentials) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const signupUser = async (userData) => {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const refreshAccessToken = async (refreshToken) => {
  return request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};

