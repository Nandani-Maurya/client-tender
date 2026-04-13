import config from '../config';

const API_URL = `${config.apiUrl}/mappings`;

export const getMappings = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error in getMappings:', error);
    throw error;
  }
};

export const getFilterOptions = async () => {
  try {
    const response = await fetch(`${API_URL}/options`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    throw error;
  }
};

export const createMapping = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Error in createMapping:', error);
    throw error;
  }
};

export const deleteMapping = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return await response.json();
  } catch (error) {
    console.error('Error in deleteMapping:', error);
    throw error;
  }
};
