import { request } from '../utils/apiClient';


export const getActiveDetails = async () => {
  return request('/add-details/active');
};


export const saveBasicDetails = async (payload) => {
  return request('/add-details/basic-firm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const saveBankDetails = async (payload) => {
  return request('/add-details/bank-details', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const saveIsoCertificates = async (payload) => {
  return request('/add-details/iso-certificates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const getBankDetails = async (orgId) => {
  return request(`/add-details/bank/${orgId}`);
};


export const getIsoCertificates = async (orgId) => {
  return request(`/add-details/iso/${orgId}`);
};
