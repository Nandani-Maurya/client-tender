import { getToken, getRefreshToken, setToken, setRefreshToken, setUser, logout } from './auth';
import config from '../config';
import { handleResponse } from './apiHandler';

let refreshPromise = null;


export const request = async (endpoint, options = {}) => {
  const url = `${config.apiUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.body instanceof FormData || headers['Content-Type'] === undefined) {
    delete headers['Content-Type'];
  }

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });


  if (response.status === 401) {
    const data = await response.clone().json().catch(() => ({}));

    if (data.code === 'TOKEN_EXPIRED') {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {

          if (!refreshPromise) {
            refreshPromise = fetch(`${config.apiUrl}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            }).then(async (res) => {
              if (res.ok) {
                const refreshData = await res.json();
                const { token, refreshToken: newRefreshToken, user } = refreshData.data;
                setToken(token);
                if (newRefreshToken) setRefreshToken(newRefreshToken);
                if (user) setUser(user);
                return token;
              } else {
                throw new Error('Refresh failed');
              }
            }).finally(() => {
              refreshPromise = null;
            });
          }

          const newToken = await refreshPromise;


          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } catch (error) {
          console.error('Refresh token failed:', error);

          return handleResponse(response);
        }
      } else {
        return handleResponse(response);
      }
    } else {

      return handleResponse(response);
    }
  }

  return handleResponse(response);
};
