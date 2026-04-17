import { request } from '../utils/apiClient';

export const getProjectTypes = async () => {
  return request('/project-types');
};

export const createProjectType = async (data) => {
  return request('/project-types', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateProjectType = async (id, data) => {
  return request(`/project-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteProjectType = async (id) => {
  return request(`/project-types/${id}`, {
    method: 'DELETE'
  });
};
