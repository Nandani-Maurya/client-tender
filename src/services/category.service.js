import config from '../config';

const API_URL = `${config.apiUrl}/categories`;

export const getTenderCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/tender`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error in getTenderCategories:', error);
    throw error;
  }
};

export const createTenderCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_URL}/tender`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(categoryData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error in createTenderCategory:', error);
    throw error;
  }
};

export const updateTenderCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_URL}/tender/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(categoryData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error in updateTenderCategory:', error);
    throw error;
  }
};

export const deleteTenderCategory = async (id) => {
  try {
    const response = await fetch(`${API_URL}/tender/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error in deleteTenderCategory:', error);
    throw error;
  }
};
