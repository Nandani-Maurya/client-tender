import { request } from '../utils/apiClient';

export const getTenderCategories = async () => {
  return request('/categories/tender');
};

export const createTenderCategory = async (categoryData) => {
  return request('/categories/tender', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  });
};

export const updateTenderCategory = async (id, categoryData) => {
  return request(`/categories/tender/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
  });
};

export const deleteTenderCategory = async (id) => {
  return request(`/categories/tender/${id}`, {
    method: 'DELETE'
  });
};
