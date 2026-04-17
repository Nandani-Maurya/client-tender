import { request } from '../utils/apiClient';

export const uploadDocument = async (file, label) => {
  const formData = new FormData();
  formData.append('document', file);
  if (label) {
    formData.append('label', label);
  }

  return request('/documents', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': undefined
    }
  });
};
